# Real-Time Collaboration Architecture

**Project:** Steno - Demand Letter Generator
**Document:** WebSocket Architecture for Real-Time Collaboration (P1 Feature)
**Version:** 1.0
**Last Updated:** 2025-12-04

---

## Overview

This document specifies the real-time collaboration architecture for the Demand Letter Generator, enabling multiple users to simultaneously edit letters with live cursor tracking, change synchronization, and conflict resolution. This is a **P1 (Phase 2) feature**, implemented after the MVP launch.

---

## Table of Contents

1. [Use Cases](#use-cases)
2. [Architecture Overview](#architecture-overview)
3. [WebSocket Infrastructure](#websocket-infrastructure)
4. [Operational Transformation](#operational-transformation)
5. [Presence & Cursors](#presence--cursors)
6. [Conflict Resolution](#conflict-resolution)
7. [State Management](#state-management)
8. [Performance & Scalability](#performance--scalability)

---

## Use Cases

### Primary Use Cases

**1. Simultaneous Editing**
- Attorney and paralegal edit different sections of the same letter
- Changes appear instantly for both users
- No edit conflicts or lost changes

**2. Presence Awareness**
- See who else is viewing/editing the letter
- View collaborators' cursor positions
- Real-time status indicators (typing, idle, away)

**3. Live Comments**
- Add comments to specific text selections
- Reply to comments in real-time
- Tag users for notifications
- Resolve comment threads

**4. Change Notifications**
- Get notified when others make changes
- Highlight recently edited sections
- Display "User X is typing..." indicators

---

## Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ TipTap Editor with Yjs Collaboration Extension             │ │
│  │ - Y.Doc (CRDT document model)                              │ │
│  │ - Awareness Protocol (cursors, presence)                   │ │
│  └────────────────┬───────────────────────────────────────────┘ │
│                   │                                              │
└───────────────────┼──────────────────────────────────────────────┘
                    │ WebSocket (wss://)
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    AWS API Gateway WebSocket                     │
│  - Connection management                                         │
│  - Authentication (JWT)                                          │
│  - Route messages to Lambda                                      │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Lambda Functions (Node.js)                      │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ $connect         │  │ $disconnect      │  │ $default     │ │
│  │ - Authenticate   │  │ - Cleanup        │  │ - Route msgs │ │
│  │ - Store connID   │  │ - Remove connID  │  │ - Broadcast  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│              Redis (ElastiCache) - P1 Requirement                │
│  - Connection mapping (connectionId → userId, letterId)          │
│  - Document state (Yjs Y.Doc binary)                            │
│  - Presence data (active users per letter)                      │
│  - TTL: 24 hours (auto-cleanup)                                 │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    PostgreSQL (RDS)                              │
│  - collaboration table (audit trail)                             │
│  - letter_version table (save points)                            │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack (Collaboration)

**Frontend:**
- **Yjs:** CRDT library for conflict-free collaboration
- **y-websocket:** WebSocket provider for Yjs
- **@tiptap/extension-collaboration:** TipTap + Yjs integration
- **@tiptap/extension-collaboration-cursor:** Cursor tracking

**Backend:**
- **AWS API Gateway WebSocket:** Managed WebSocket connections
- **Lambda (Node.js):** Connection handlers and message routing
- **Redis (ElastiCache):** Fast state storage and pub/sub
- **PostgreSQL:** Persistent audit trail

---

## WebSocket Infrastructure

### API Gateway WebSocket

**Endpoint:**
```
wss://ws.stenodemandletters.com/v1
```

**Connection URL:**
```
wss://ws.stenodemandletters.com/v1?token=<jwt_token>&letterId=<letter-uuid>
```

**Routes:**

| Route | Lambda Function | Purpose |
|-------|-----------------|---------|
| `$connect` | onConnect | Authenticate and register connection |
| `$disconnect` | onDisconnect | Clean up connection state |
| `$default` | onMessage | Handle all messages (sync, awareness) |

### Connection Lifecycle

**1. Connection ($connect):**

```typescript
// lambda/collaboration/onConnect.ts
export async function handler(event: APIGatewayProxyEvent) {
  const connectionId = event.requestContext.connectionId;
  const token = event.queryStringParameters.token;
  const letterId = event.queryStringParameters.letterId;

  // Authenticate JWT
  const user = await verifyJWT(token);
  if (!user) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  // Verify user has access to letter
  const letter = await prisma.demandLetter.findFirst({
    where: { letterId, firmId: user.firmId }
  });
  if (!letter) {
    return { statusCode: 403, body: 'Forbidden' };
  }

  // Store connection mapping in Redis
  await redis.hset(`connection:${connectionId}`, {
    userId: user.userId,
    letterId: letterId,
    firmId: user.firmId,
    connectedAt: Date.now()
  });

  // Add to letter's active connections set
  await redis.sadd(`letter:${letterId}:connections`, connectionId);

  // Notify other users
  await broadcastToLetter(letterId, {
    type: 'user-joined',
    user: {
      userId: user.userId,
      name: `${user.firstName} ${user.lastName}`,
      color: assignColor(user.userId)
    }
  });

  return { statusCode: 200, body: 'Connected' };
}
```

**2. Message Handling ($default):**

```typescript
// lambda/collaboration/onMessage.ts
export async function handler(event: APIGatewayProxyEvent) {
  const connectionId = event.requestContext.connectionId;
  const message = JSON.parse(event.body);

  // Get connection metadata
  const conn = await redis.hgetall(`connection:${connectionId}`);
  const { userId, letterId } = conn;

  switch (message.type) {
    case 'sync':
      await handleSync(connectionId, letterId, message.data);
      break;

    case 'awareness':
      await handleAwareness(connectionId, letterId, message.data);
      break;

    case 'comment':
      await handleComment(userId, letterId, message.data);
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }

  return { statusCode: 200, body: 'OK' };
}
```

**3. Disconnection ($disconnect):**

```typescript
// lambda/collaboration/onDisconnect.ts
export async function handler(event: APIGatewayProxyEvent) {
  const connectionId = event.requestContext.connectionId;

  // Get connection metadata
  const conn = await redis.hgetall(`connection:${connectionId}`);
  const { userId, letterId, firmId } = conn;

  // Remove from letter's active connections
  await redis.srem(`letter:${letterId}:connections`, connectionId);

  // Delete connection mapping
  await redis.del(`connection:${connectionId}`);

  // Notify other users
  await broadcastToLetter(letterId, {
    type: 'user-left',
    userId: userId
  });

  // Save final state to database (audit trail)
  await prisma.collaboration.create({
    data: {
      letterId,
      userId,
      changeType: 'session-end',
      changeData: { disconnectedAt: Date.now() },
      timestamp: new Date()
    }
  });

  return { statusCode: 200, body: 'Disconnected' };
}
```

### Broadcasting Messages

```typescript
// utils/broadcast.ts
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const apiGateway = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_ENDPOINT
});

export async function broadcastToLetter(letterId: string, message: any) {
  // Get all active connections for this letter
  const connectionIds = await redis.smembers(`letter:${letterId}:connections`);

  // Send message to all connections
  const promises = connectionIds.map(async (connectionId) => {
    try {
      await apiGateway.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(message)
      }));
    } catch (err) {
      if (err.statusCode === 410) {
        // Connection is stale, remove it
        await redis.srem(`letter:${letterId}:connections`, connectionId);
      }
    }
  });

  await Promise.allSettled(promises);
}
```

---

## Operational Transformation

### Yjs CRDT (Conflict-Free Replicated Data Type)

**Why Yjs:**
- Automatically resolves conflicts without central coordination
- No server-side operational transformation logic needed
- Proven technology (used by Figma, Notion, others)
- Efficient binary protocol

**Frontend Integration:**

```typescript
// components/CollaborativeEditor.tsx
import { useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function CollaborativeEditor({ letterId, user }) {
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Connect to WebSocket server
  const provider = useMemo(() => {
    return new WebsocketProvider(
      'wss://ws.stenodemandletters.com/v1',
      `letter-${letterId}`,
      ydoc,
      {
        params: {
          token: getAccessToken(),
          letterId: letterId
        }
      }
    );
  }, [letterId]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: `${user.firstName} ${user.lastName}`,
          color: user.color || '#FF6B6B'
        }
      })
    ],
    content: letterContent
  });

  return <EditorContent editor={editor} />;
}
```

### Sync Protocol

**Message Types:**

**1. Sync Step 1 (Initial State Request):**
```json
{
  "type": "sync",
  "data": {
    "syncStep": 1,
    "stateVector": "<binary-encoded-state-vector>"
  }
}
```

**2. Sync Step 2 (State Update):**
```json
{
  "type": "sync",
  "data": {
    "syncStep": 2,
    "update": "<binary-encoded-update>"
  }
}
```

**3. Update (Incremental Changes):**
```json
{
  "type": "sync",
  "data": {
    "update": "<binary-encoded-update>"
  }
}
```

### State Persistence

**Redis (Ephemeral State):**
```typescript
// Store Yjs document state in Redis
const ydocBinary = Y.encodeStateAsUpdate(ydoc);
await redis.set(`ydoc:${letterId}`, ydocBinary, 'EX', 86400); // 24h TTL

// Restore state on reconnect
const ydocBinary = await redis.get(`ydoc:${letterId}`);
if (ydocBinary) {
  Y.applyUpdate(ydoc, ydocBinary);
}
```

**PostgreSQL (Persistent Save Points):**
```typescript
// Save snapshot every 5 minutes or on major changes
async function saveSnapshot(letterId: string, ydoc: Y.Doc) {
  const content = ydoc.getText('content').toString();

  await prisma.letterVersion.create({
    data: {
      letterId,
      versionNumber: nextVersionNumber,
      content: content,
      changeData: { type: 'autosave', source: 'collaboration' },
      createdAt: new Date()
    }
  });
}
```

---

## Presence & Cursors

### Awareness Protocol

**User Awareness State:**
```typescript
provider.awareness.setLocalStateField('user', {
  name: 'John Doe',
  color: '#FF6B6B',
  cursor: { position: 450, section: 'liability' },
  lastActivity: Date.now(),
  status: 'active' // active | typing | idle | away
});
```

**Awareness Message:**
```json
{
  "type": "awareness",
  "data": {
    "userId": "user-uuid",
    "user": {
      "name": "John Doe",
      "color": "#FF6B6B",
      "cursor": { "position": 450, "section": "liability" },
      "lastActivity": 1701388800000,
      "status": "typing"
    }
  }
}
```

### Cursor Rendering

**Frontend (TipTap):**
```typescript
// CollaborationCursor extension renders cursors automatically
const editor = useEditor({
  extensions: [
    CollaborationCursor.configure({
      provider: provider,
      user: {
        name: user.name,
        color: user.color
      },
      render: (user) => {
        const cursor = document.createElement('span');
        cursor.classList.add('collaboration-cursor');
        cursor.style.borderColor = user.color;

        const label = document.createElement('div');
        label.classList.add('collaboration-cursor__label');
        label.style.backgroundColor = user.color;
        label.textContent = user.name;
        cursor.appendChild(label);

        return cursor;
      }
    })
  ]
});
```

**CSS:**
```css
.collaboration-cursor {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 2px solid;
  border-right: 2px solid;
  word-break: normal;
  pointer-events: none;
}

.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  color: white;
  padding: 2px 6px;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
  user-select: none;
}
```

### Active Users List

```typescript
// components/ActiveUsers.tsx
export function ActiveUsers({ provider }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const updateUsers = () => {
      const awarenessStates = Array.from(provider.awareness.getStates().values());
      const activeUsers = awarenessStates
        .filter(state => state.user)
        .map(state => state.user);
      setUsers(activeUsers);
    };

    provider.awareness.on('change', updateUsers);
    updateUsers();

    return () => provider.awareness.off('change', updateUsers);
  }, [provider]);

  return (
    <div className="active-users">
      {users.map(user => (
        <div key={user.name} className="user-avatar" style={{ backgroundColor: user.color }}>
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
      ))}
    </div>
  );
}
```

---

## Conflict Resolution

### Automatic Conflict Resolution (Yjs)

Yjs handles conflicts automatically using CRDT algorithms:

**Scenario: Simultaneous Edits**
1. User A types "negligent" at position 100
2. User B types "liable" at position 100
3. Yjs merges both changes deterministically
4. Result: Both words appear (order determined by client IDs)

**No Manual Conflict Resolution Needed:**
- Yjs guarantees eventual consistency
- All clients converge to the same state
- No "conflict markers" or manual merges

### Intention Preservation

Yjs preserves user intent:

**Example:**
- User A: Adds text "The defendant"
- User B: Simultaneously deletes text after "The"
- Result: "The defendant" appears (User A's intent preserved)

### Concurrency Control (Application Level)

**Section-Level Locking (Optional):**
```typescript
// Optional: Lock sections while editing to reduce conflicts
async function lockSection(letterId: string, section: string, userId: string) {
  const key = `lock:${letterId}:${section}`;
  const acquired = await redis.set(key, userId, 'NX', 'EX', 300); // 5-min TTL

  if (!acquired) {
    const lockedBy = await redis.get(key);
    return { success: false, lockedBy };
  }

  return { success: true };
}
```

---

## State Management

### Redis Data Structures

**Connection Mapping:**
```
connection:<connectionId> → Hash {
  userId: "user-uuid",
  letterId: "letter-uuid",
  firmId: "firm-uuid",
  connectedAt: 1701388800000
}
TTL: 24 hours
```

**Letter Connections:**
```
letter:<letterId>:connections → Set {
  "connectionId1",
  "connectionId2",
  ...
}
TTL: 24 hours (refreshed on activity)
```

**Document State:**
```
ydoc:<letterId> → Binary (Yjs Y.Doc state)
TTL: 24 hours (refreshed on update)
```

**Presence Data:**
```
presence:<letterId> → Hash {
  "<userId>": JSON { name, color, cursor, lastActivity },
  ...
}
TTL: 24 hours
```

### State Synchronization

**On Connection:**
1. Client requests initial state
2. Server loads Yjs state from Redis
3. Server sends state to client
4. Client applies state to local Yjs doc

**During Editing:**
1. Client makes local edit
2. Yjs generates update
3. Update sent to server via WebSocket
4. Server broadcasts to all connected clients
5. Server persists update to Redis

**On Disconnect:**
1. Client disconnects
2. Server removes from active connections
3. Yjs state remains in Redis (for rejoins)
4. Periodic save to PostgreSQL (database of record)

---

## Performance & Scalability

### Performance Targets

| Metric | Target |
|--------|--------|
| Message Latency (p95) | < 100ms |
| Sync Latency (p95) | < 200ms |
| Concurrent Users per Letter | 10+ |
| Total Concurrent Connections | 10,000+ |
| Message Throughput | 10,000 msg/sec |

### Scalability Strategies

**1. Horizontal Scaling (Lambda):**
- Lambda auto-scales to handle WebSocket connections
- No configuration needed (AWS-managed)
- Concurrent execution limit: 1000 (can request increase)

**2. Redis Clustering (P1):**
- Single Redis instance: 25,000 connections
- Redis Cluster: 100,000+ connections (multi-node)
- Partitioning: Shard by letterId

**3. API Gateway Limits:**
- Default: 10,000 concurrent connections
- Request limit increase from AWS (up to 100,000+)

**4. Batching & Throttling:**
- Batch awareness updates (send every 100ms, not on every keystroke)
- Throttle broadcasts to reduce message volume
- Debounce cursor position updates

### Optimization Techniques

**1. Binary Protocol:**
- Yjs uses efficient binary encoding (not JSON)
- Smaller message sizes (50-80% reduction)

**2. Update Compression:**
- Gzip WebSocket messages
- Reduces bandwidth by 70-90%

**3. State Compaction:**
- Periodically compact Yjs document state
- Remove tombstones and compress history
- Reduces memory usage

**4. Connection Pooling:**
- Reuse database connections in Lambda
- Use RDS Proxy for efficient pooling

---

## Cost Estimation (Collaboration Feature)

**Additional Monthly Costs:**

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **API Gateway WebSocket** | 10M messages | $3.50 |
| **Lambda Invocations** | 10M invocations | $2.00 |
| **Lambda Duration** | 1M GB-seconds | $16.67 |
| **Redis (ElastiCache)** | cache.t3.micro | $12.41 |
| **Data Transfer** | 100 GB | $9.00 |
| **Total** | | **~$45/month** |

**Assumptions:**
- 100 active collaborators at any time
- Average 5-minute collaboration sessions
- 50 messages per session
- 1,000 collaboration sessions per day

---

## Implementation Checklist

### Phase 1: Infrastructure (Week 1-2)
- [ ] Provision Redis (ElastiCache) cluster
- [ ] Create API Gateway WebSocket API
- [ ] Deploy Lambda functions ($connect, $disconnect, $default)
- [ ] Configure IAM roles for Lambda → Redis access
- [ ] Set up CloudWatch logs and metrics

### Phase 2: Backend (Week 2-3)
- [ ] Implement connection lifecycle handlers
- [ ] Build message routing and broadcasting
- [ ] Integrate Yjs state storage in Redis
- [ ] Add awareness protocol support
- [ ] Create audit trail (collaboration table)

### Phase 3: Frontend (Week 3-4)
- [ ] Install Yjs, y-websocket, TipTap collaboration extensions
- [ ] Implement WebSocket provider
- [ ] Build collaborative editor component
- [ ] Add cursor rendering and active users list
- [ ] Handle connection errors and reconnection

### Phase 4: Testing (Week 4-5)
- [ ] Unit tests for Lambda handlers
- [ ] Integration tests for sync protocol
- [ ] Load testing (1000 concurrent connections)
- [ ] Conflict resolution testing
- [ ] Latency and performance testing

### Phase 5: Launch (Week 5-6)
- [ ] Beta testing with pilot users
- [ ] Monitor performance metrics
- [ ] Fix bugs and optimize
- [ ] Documentation for users
- [ ] General availability release

---

## Conclusion

The real-time collaboration architecture leverages Yjs CRDT for automatic conflict resolution, AWS API Gateway WebSocket for managed connections, and Redis for fast state synchronization. This design supports 10+ concurrent users per letter with sub-100ms latency, providing a seamless collaborative editing experience.

**Key Design Decisions:**
- **Yjs CRDT:** Eliminates server-side OT complexity
- **WebSocket (not polling):** Real-time with low latency
- **Redis for state:** Fast, ephemeral storage
- **PostgreSQL for audit:** Persistent record of all changes
- **Lambda for compute:** Auto-scaling, serverless

**Next Steps:**
1. Provision Redis cluster
2. Implement WebSocket Lambda handlers
3. Integrate Yjs on frontend
4. Load test with realistic scenarios
5. Beta launch to pilot users

---

## Document Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-04 | Winston | Initial real-time collaboration architecture |
