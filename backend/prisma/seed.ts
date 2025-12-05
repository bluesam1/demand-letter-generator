import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    templateName: 'Personal Injury - Auto Accident',
    templateDescription: 'Standard demand letter template for automobile accident personal injury claims. Includes sections for liability, injuries, medical treatment, and damages.',
    category: 'Automobile Accident',
    isDefault: true,
    templateContent: {
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          content: `[DATE]

{{defendant_name}}
{{defendant_address}}

Re: Personal Injury Claim - {{client_name}}
    Date of Loss: {{incident_date}}
    Claim/File Number: {{case_reference}}

Dear Claims Representative:

Please be advised that this firm represents {{client_name}} in connection with injuries sustained in an automobile accident that occurred on {{incident_date}}. This letter constitutes a formal demand for compensation for the injuries and damages our client sustained as a direct result of your insured's negligence.`,
          order: 0,
        },
        {
          id: 'facts',
          title: 'Statement of Facts',
          content: `STATEMENT OF FACTS

On {{incident_date}}, our client, {{client_name}}, was lawfully operating their vehicle when your insured negligently caused a collision. The accident occurred at {{incident_location}}.

[Describe the specific circumstances of the accident, including:
- Weather and road conditions
- Direction of travel for both vehicles
- How the collision occurred
- Police report number if available
- Witness information if applicable]

As a direct and proximate result of your insured's negligence, our client sustained significant bodily injuries requiring extensive medical treatment.`,
          order: 1,
        },
        {
          id: 'liability',
          title: 'Liability Analysis',
          content: `LIABILITY

Your insured is liable for the injuries and damages sustained by our client for the following reasons:

1. Your insured failed to exercise reasonable care in the operation of their motor vehicle.
2. Your insured violated applicable traffic laws and regulations.
3. Your insured's negligent conduct was the direct and proximate cause of the collision.
4. Our client was operating their vehicle in a lawful manner and bears no responsibility for this accident.

The liability in this matter is clear, and we expect your insured to accept full responsibility for all damages resulting from this collision.`,
          order: 2,
        },
        {
          id: 'injuries',
          title: 'Injuries and Medical Treatment',
          content: `INJURIES AND MEDICAL TREATMENT

As a direct result of this collision, {{client_name}} sustained the following injuries:

[List all injuries sustained]

Our client has undergone the following medical treatment:

[Detail medical treatment received, including:
- Emergency room visits
- Hospital stays
- Physician consultations
- Physical therapy sessions
- Diagnostic imaging (X-rays, MRIs, CT scans)
- Medications prescribed
- Any surgical procedures
- Ongoing treatment requirements]

Our client continues to experience [ongoing symptoms/pain] and may require additional treatment in the future.`,
          order: 3,
        },
        {
          id: 'damages',
          title: 'Damages',
          content: `DAMAGES

Our client has incurred the following damages as a result of your insured's negligence:

MEDICAL EXPENSES:
[List all medical bills with amounts]
Total Medical Expenses: $[AMOUNT]

LOST WAGES:
Our client was unable to work from [START DATE] to [END DATE] as a result of the injuries sustained.
Total Lost Wages: $[AMOUNT]

PAIN AND SUFFERING:
Our client has endured significant physical pain, emotional distress, and loss of enjoyment of life. The injuries have impacted our client's ability to perform daily activities, maintain relationships, and enjoy recreational pursuits.

PROPERTY DAMAGE:
[If applicable, list vehicle damage and repair/replacement costs]

FUTURE DAMAGES:
[If applicable, describe anticipated future medical treatment, ongoing limitations, or permanent impairment]`,
          order: 4,
        },
        {
          id: 'demand',
          title: 'Settlement Demand',
          content: `DEMAND FOR SETTLEMENT

Based on the foregoing, we hereby demand the sum of {{demand_amount}} to fully and finally resolve all claims arising from this incident. This demand includes compensation for:

- Past and future medical expenses
- Lost wages and diminished earning capacity
- Pain and suffering
- Emotional distress
- Loss of enjoyment of life
- Property damage
- Any and all other applicable damages

This demand will remain open for thirty (30) days from the date of this letter. If we do not receive a satisfactory response within this time frame, we will have no alternative but to pursue all available legal remedies, including the filing of a lawsuit.`,
          order: 5,
        },
        {
          id: 'closing',
          title: 'Closing',
          content: `Please direct all settlement communications to our office. Do not contact our client directly.

We look forward to your prompt response and the amicable resolution of this matter.

Very truly yours,

{{firm_name}}


{{attorney_name}}
{{attorney_title}}
Bar Number: {{attorney_bar_number}}

Enclosures:
- Medical records and bills
- Photographs
- Police report
- [Other supporting documentation]`,
          order: 6,
        },
      ],
      variables: [
        'client_name',
        'defendant_name',
        'defendant_address',
        'incident_date',
        'incident_location',
        'case_reference',
        'demand_amount',
        'firm_name',
        'attorney_name',
        'attorney_title',
        'attorney_bar_number',
      ],
    },
  },
  {
    templateName: 'Slip and Fall - Premises Liability',
    templateDescription: 'Demand letter template for slip and fall accidents on commercial or residential property. Covers premises liability, hazardous conditions, and property owner negligence.',
    category: 'Slip and Fall',
    isDefault: false,
    templateContent: {
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          content: `[DATE]

{{defendant_name}}
{{defendant_address}}

Re: Premises Liability Claim - {{client_name}}
    Date of Incident: {{incident_date}}
    Location: {{incident_location}}
    Claim Number: {{case_reference}}

Dear Sir or Madam:

This firm represents {{client_name}} regarding injuries sustained on your property on {{incident_date}}. This letter serves as formal notice of claim and demand for compensation.`,
          order: 0,
        },
        {
          id: 'facts',
          title: 'Statement of Facts',
          content: `STATEMENT OF FACTS

On {{incident_date}}, our client, {{client_name}}, was lawfully present on the premises located at {{incident_location}} when they slipped/tripped and fell due to a hazardous condition on the property.

[Describe the specific hazardous condition, such as:
- Wet or slippery floor surface
- Uneven flooring or torn carpet
- Poor lighting conditions
- Debris or obstacles in walkway
- Icy or snow-covered walkways
- Broken stairs or handrails
- Missing warning signs]

The hazardous condition was known or should have been known to the property owner/manager, yet no action was taken to remedy the condition or warn visitors of the danger.`,
          order: 1,
        },
        {
          id: 'liability',
          title: 'Liability',
          content: `LIABILITY

Under premises liability law, property owners have a duty to maintain their property in a reasonably safe condition and to warn of known hazards. You breached this duty by:

1. Failing to inspect and maintain the premises in a safe condition
2. Failing to discover and remedy the hazardous condition
3. Failing to provide adequate warning of the dangerous condition
4. Creating or allowing a foreseeable risk of harm to lawful visitors

Your negligence was the direct and proximate cause of our client's injuries. Had proper maintenance and safety protocols been followed, this incident would not have occurred.`,
          order: 2,
        },
        {
          id: 'injuries',
          title: 'Injuries and Treatment',
          content: `INJURIES AND MEDICAL TREATMENT

As a result of the fall, {{client_name}} sustained serious injuries including:

[List injuries such as:
- Fractures
- Soft tissue injuries
- Back or spinal injuries
- Head injuries
- Sprains or strains]

Medical treatment has included:

[Detail treatment received]

Our client's injuries have significantly impacted their daily life, ability to work, and overall quality of life.`,
          order: 3,
        },
        {
          id: 'damages',
          title: 'Damages',
          content: `DAMAGES

The following damages have been incurred:

Medical Expenses (to date): $[AMOUNT]
Anticipated Future Medical Costs: $[AMOUNT]
Lost Wages: $[AMOUNT]
Loss of Earning Capacity: $[AMOUNT]
Pain and Suffering: $[AMOUNT]

TOTAL DAMAGES: $[TOTAL]`,
          order: 4,
        },
        {
          id: 'demand',
          title: 'Demand',
          content: `SETTLEMENT DEMAND

We hereby demand {{demand_amount}} to resolve all claims arising from this incident.

This demand will expire in thirty (30) days. Failure to respond may result in litigation without further notice.

Please contact our office to discuss settlement. Do not contact our client directly.

Respectfully,

{{firm_name}}

{{attorney_name}}
{{attorney_title}}`,
          order: 5,
        },
      ],
      variables: [
        'client_name',
        'defendant_name',
        'defendant_address',
        'incident_date',
        'incident_location',
        'case_reference',
        'demand_amount',
        'firm_name',
        'attorney_name',
        'attorney_title',
      ],
    },
  },
  {
    templateName: 'Medical Malpractice',
    templateDescription: 'Comprehensive demand letter for medical malpractice claims involving negligent medical care, misdiagnosis, surgical errors, or medication errors.',
    category: 'Medical Malpractice',
    isDefault: false,
    templateContent: {
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          content: `[DATE]

VIA CERTIFIED MAIL - RETURN RECEIPT REQUESTED

{{defendant_name}}
{{defendant_address}}

Re: Notice of Medical Malpractice Claim
    Patient: {{client_name}}
    Date(s) of Treatment: {{incident_date}}
    Claim Reference: {{case_reference}}

Dear Dr./Administrator:

This letter serves as formal notice of a medical malpractice claim on behalf of our client, {{client_name}}, arising from negligent medical care provided at your facility.`,
          order: 0,
        },
        {
          id: 'background',
          title: 'Medical Background',
          content: `PATIENT HISTORY AND PRESENTING CONDITION

{{client_name}} presented for medical care on or about {{incident_date}} with the following condition(s):

[Describe the patient's presenting symptoms, medical history relevant to the claim, and reason for seeking treatment]

The patient was entitled to receive medical care meeting the applicable standard of care for their condition.`,
          order: 1,
        },
        {
          id: 'negligence',
          title: 'Acts of Negligence',
          content: `ACTS OF MEDICAL NEGLIGENCE

The healthcare provider(s) deviated from the accepted standard of medical care in the following ways:

1. [Describe specific acts of negligence, such as:
   - Failure to properly diagnose
   - Delayed diagnosis or treatment
   - Surgical errors
   - Medication errors
   - Failure to obtain informed consent
   - Failure to order appropriate tests
   - Misinterpretation of test results
   - Failure to follow up on abnormal findings]

These deviations from the standard of care were the direct and proximate cause of our client's injuries.`,
          order: 2,
        },
        {
          id: 'causation',
          title: 'Causation and Injuries',
          content: `CAUSATION AND RESULTING INJURIES

As a direct result of the negligent medical care described above, {{client_name}} suffered the following injuries and complications:

[List all injuries and complications attributable to the malpractice]

Had proper medical care been provided, these injuries would not have occurred, or the outcome would have been significantly better.

Expert medical opinion has been obtained confirming that the care provided fell below the applicable standard of care and directly caused our client's injuries.`,
          order: 3,
        },
        {
          id: 'damages',
          title: 'Damages',
          content: `DAMAGES

Our client has suffered the following damages:

PAST MEDICAL EXPENSES:
[Itemize additional medical costs incurred due to the malpractice]
Subtotal: $[AMOUNT]

FUTURE MEDICAL EXPENSES:
[Describe anticipated future care needs and costs]
Subtotal: $[AMOUNT]

LOST INCOME:
Past Lost Wages: $[AMOUNT]
Future Lost Earning Capacity: $[AMOUNT]

NON-ECONOMIC DAMAGES:
- Physical pain and suffering
- Emotional distress
- Loss of enjoyment of life
- Disfigurement/scarring
- Loss of consortium (if applicable)

TOTAL DAMAGES: $[AMOUNT]`,
          order: 4,
        },
        {
          id: 'demand',
          title: 'Demand and Conclusion',
          content: `SETTLEMENT DEMAND

Based on the foregoing, we demand {{demand_amount}} to fully resolve all claims against you and/or your facility.

Please be advised that relevant statutes of limitation are being monitored, and litigation will be commenced if necessary to protect our client's interests.

We request your response within forty-five (45) days.

All communications should be directed to this office. Please provide your professional liability insurance carrier information for direct communication if appropriate.

Very truly yours,

{{firm_name}}


{{attorney_name}}
{{attorney_title}}
Bar Number: {{attorney_bar_number}}`,
          order: 5,
        },
      ],
      variables: [
        'client_name',
        'defendant_name',
        'defendant_address',
        'incident_date',
        'case_reference',
        'demand_amount',
        'firm_name',
        'attorney_name',
        'attorney_title',
        'attorney_bar_number',
      ],
    },
  },
  {
    templateName: 'Property Damage - Insurance Claim',
    templateDescription: 'Demand letter for property damage claims against insurance companies for denied, delayed, or underpaid claims.',
    category: 'Property Damage',
    isDefault: false,
    templateContent: {
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          content: `[DATE]

{{defendant_name}}
{{defendant_address}}

Re: Property Damage Claim
    Insured: {{client_name}}
    Policy Number: {{case_reference}}
    Date of Loss: {{incident_date}}
    Property Address: {{incident_location}}

Dear Claims Manager:

This firm represents {{client_name}} regarding the above-referenced property damage claim. We write to formally demand fair compensation for our client's covered losses.`,
          order: 0,
        },
        {
          id: 'policy',
          title: 'Policy Coverage',
          content: `INSURANCE POLICY AND COVERAGE

Our client maintained a valid insurance policy (Policy No. {{case_reference}}) with your company at the time of the loss. The policy provides coverage for the type of damage sustained, including:

[List applicable coverage types:
- Dwelling coverage
- Personal property coverage
- Additional living expenses
- Other structures coverage]

Our client has fully complied with all policy conditions and requirements, including timely notice of the claim and cooperation with your investigation.`,
          order: 1,
        },
        {
          id: 'loss',
          title: 'Description of Loss',
          content: `DESCRIPTION OF LOSS

On {{incident_date}}, the insured property located at {{incident_location}} sustained significant damage due to:

[Describe cause of loss:
- Fire
- Water damage/flooding
- Storm/wind damage
- Theft/vandalism
- Other covered peril]

The damage includes:

[Detail the specific damage to the property, including affected areas, structural damage, damaged personal property, etc.]`,
          order: 2,
        },
        {
          id: 'claim_history',
          title: 'Claim History',
          content: `CLAIM HANDLING ISSUES

Our client promptly reported this loss and has cooperated fully with your investigation. However, we are concerned about the following issues in the handling of this claim:

[Address applicable issues:
- Unreasonable delay in investigation or payment
- Inadequate or lowball settlement offer
- Improper claim denial
- Failure to communicate
- Misrepresentation of policy terms
- Bad faith handling practices]

Your company has a duty to handle claims fairly, promptly, and in good faith.`,
          order: 3,
        },
        {
          id: 'damages',
          title: 'Damages Claimed',
          content: `DAMAGES

Based on independent evaluation, our client's covered damages are as follows:

Structural Repairs: $[AMOUNT]
Personal Property Loss: $[AMOUNT]
Additional Living Expenses: $[AMOUNT]
Other Covered Losses: $[AMOUNT]

TOTAL COVERED DAMAGES: $[AMOUNT]

[If applicable: Less deductible of $[AMOUNT]]

AMOUNT DUE: {{demand_amount}}`,
          order: 4,
        },
        {
          id: 'demand',
          title: 'Demand',
          content: `DEMAND

We demand payment of {{demand_amount}} within twenty (20) days of this letter, representing the full amount owed under the policy.

Failure to pay this claim may result in litigation seeking not only policy benefits but also damages for bad faith, attorney's fees, and statutory penalties as permitted by law.

Please respond to this office with payment or a detailed written explanation if you contend any portion of the claim is not covered.

Sincerely,

{{firm_name}}

{{attorney_name}}
{{attorney_title}}`,
          order: 5,
        },
      ],
      variables: [
        'client_name',
        'defendant_name',
        'defendant_address',
        'incident_date',
        'incident_location',
        'case_reference',
        'demand_amount',
        'firm_name',
        'attorney_name',
        'attorney_title',
      ],
    },
  },
  {
    templateName: 'Dog Bite / Animal Attack',
    templateDescription: 'Demand letter for dog bite and animal attack cases. Covers strict liability, negligence, and common injuries from animal attacks.',
    category: 'Personal Injury',
    isDefault: false,
    templateContent: {
      sections: [
        {
          id: 'intro',
          title: 'Introduction',
          content: `[DATE]

{{defendant_name}}
{{defendant_address}}

Re: Dog Bite / Animal Attack Claim
    Claimant: {{client_name}}
    Date of Attack: {{incident_date}}
    Location: {{incident_location}}

Dear {{defendant_name}}:

This firm represents {{client_name}} in connection with injuries sustained from a dog bite/animal attack that occurred on {{incident_date}} at {{incident_location}}.`,
          order: 0,
        },
        {
          id: 'facts',
          title: 'Facts of the Incident',
          content: `STATEMENT OF FACTS

On {{incident_date}}, our client was lawfully present at/near {{incident_location}} when your dog attacked them without provocation.

[Describe the circumstances:
- What the victim was doing at the time
- How the attack occurred
- Description of the animal
- Any prior incidents or known dangerous propensities
- Whether the animal was restrained or under control
- Actions taken after the attack]

The attack was sudden, unprovoked, and entirely preventable had proper precautions been taken.`,
          order: 1,
        },
        {
          id: 'liability',
          title: 'Liability',
          content: `LIABILITY

As the owner/keeper of the animal, you are liable for our client's injuries under applicable law:

1. STRICT LIABILITY: [State name] imposes strict liability on dog owners for injuries caused by their animals, regardless of the owner's knowledge of the animal's dangerous propensities.

2. NEGLIGENCE: Alternatively, you were negligent in:
   - Failing to properly restrain or control your animal
   - Failing to warn of the animal's dangerous tendencies
   - Allowing the animal to roam freely
   - Failing to take precautions despite knowledge of prior incidents

You bear full responsibility for all damages resulting from this attack.`,
          order: 2,
        },
        {
          id: 'injuries',
          title: 'Injuries',
          content: `INJURIES AND TREATMENT

The attack caused our client to sustain the following injuries:

[List injuries such as:
- Puncture wounds and lacerations
- Crush injuries from bite force
- Nerve damage
- Scarring and disfigurement
- Infection or disease transmission risk
- Psychological trauma/PTSD]

Medical treatment has included:

[Detail emergency care, wound treatment, surgeries, rabies prophylaxis, plastic surgery, psychological counseling, etc.]

Our client may require additional treatment including scar revision surgery and ongoing psychological care.`,
          order: 3,
        },
        {
          id: 'damages',
          title: 'Damages',
          content: `DAMAGES

Medical Expenses: $[AMOUNT]
Future Medical/Surgical Costs: $[AMOUNT]
Lost Wages: $[AMOUNT]
Pain and Suffering: $[AMOUNT]
Permanent Scarring/Disfigurement: $[AMOUNT]
Psychological Trauma: $[AMOUNT]

TOTAL: $[AMOUNT]`,
          order: 4,
        },
        {
          id: 'demand',
          title: 'Demand',
          content: `DEMAND

We demand {{demand_amount}} to settle all claims arising from this attack.

This demand is open for thirty (30) days. Please provide your homeowner's or renter's insurance information for this claim.

If you are uninsured, we are prepared to pursue all legal remedies, which may include garnishment of wages, liens on property, and other collection efforts.

Respond to this office only. Do not contact our client.

Sincerely,

{{firm_name}}

{{attorney_name}}
{{attorney_title}}`,
          order: 5,
        },
      ],
      variables: [
        'client_name',
        'defendant_name',
        'defendant_address',
        'incident_date',
        'incident_location',
        'demand_amount',
        'firm_name',
        'attorney_name',
        'attorney_title',
      ],
    },
  },
];

async function main() {
  console.log('Starting template seed...');

  // Get the first firm and user to associate templates with
  const firm = await prisma.firm.findFirst({
    include: { users: true },
  });

  if (!firm) {
    console.log('No firm found. Please register a user first, then run this seed.');
    console.log('You can register at: http://localhost:5174/register');
    return;
  }

  const user = firm.users[0];
  if (!user) {
    console.log('No user found in firm. Please ensure a user exists.');
    return;
  }

  console.log(`Found firm: ${firm.firmName} (${firm.id})`);
  console.log(`Using user: ${user.email} (${user.id})`);

  // Check for existing templates to avoid duplicates
  const existingTemplates = await prisma.template.findMany({
    where: { firmId: firm.id },
    select: { templateName: true },
  });
  const existingNames = new Set(existingTemplates.map((t) => t.templateName));

  let created = 0;
  let skipped = 0;

  for (const template of templates) {
    if (existingNames.has(template.templateName)) {
      console.log(`Skipping existing template: ${template.templateName}`);
      skipped++;
      continue;
    }

    await prisma.template.create({
      data: {
        firmId: firm.id,
        createdById: user.id,
        templateName: template.templateName,
        templateDescription: template.templateDescription,
        templateContent: template.templateContent,
        category: template.category,
        isDefault: template.isDefault && created === 0, // Only first one as default
        isActive: true,
        version: 1,
        usageCount: 0,
      },
    });

    console.log(`Created template: ${template.templateName}`);
    created++;
  }

  console.log(`\nSeed complete! Created ${created} templates, skipped ${skipped} existing.`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
