/* Two Victorias — structured comparison data.
   Editable by non-developers: each row is one statutory asymmetry.
   domain: lawmaking | identity | land | culture | funding
   NOTE: plain-English summaries drafted from the Statewide Treaty Act 2025 and
   public reporting. Verify clause references against the consolidated Act
   before publication. */
window.TV_ROWS = [
  {
    id: "scrutiny",
    domain: "lawmaking",
    label: "Scrutiny of new laws",
    general: "May make a submission to Parliament like any member of the public. No statutory right to be consulted on Bills.",
    fp: "Every new Bill must be accompanied by a treaty-compatibility statement, and Gellung Warl must be notified of proposed laws and policies that affect First Peoples.",
    clause: "Cl 66; Part 4",
    pull: "\u201cA member of Parliament who introduces a Bill\u2026 must cause a statement of treaty compatibility to be prepared\u2026\u201d",
    gov: "Compatibility statements are advisory, like Charter of Human Rights statements. Parliament keeps the final say on every law and no Bill can be blocked.",
    source: "Statewide Treaty Act 2025 \u2014 legislation.vic.gov.au; Assembly Hansard, 16 Oct 2025"
  },
  {
    id: "body",
    domain: "lawmaking",
    label: "A permanent representative body",
    general: "Represented by the Parliament of Victoria \u2014 88 MPs in the Assembly, 40 in the Council \u2014 elected by all Victorians.",
    fp: "Additionally represented by Gellung Warl, a permanent statutory Assembly with ongoing powers, established 1 May 2026, elected only by enrolled First Peoples.",
    clause: "Parts 3\u20134",
    pull: "\u201cGellung Warl is established as the ongoing First Peoples\u2019 representative body\u2026\u201d",
    gov: "Gellung Warl is a representative and advisory body, not a third chamber. It cannot veto legislation and is subject to Victorian integrity bodies including IBAC and the Ombudsman.",
    source: "Statewide Treaty Act 2025, Parts 3\u20134"
  },
  {
    id: "ministers",
    domain: "lawmaking",
    label: "Access to ministers and officials",
    general: "May write to a minister or request a meeting. No obligation on the minister to attend.",
    fp: "Gellung Warl\u2019s questions to ministers and agency heads must be answered, and Ministers and the Chief Commissioner of Police are required to attend representation meetings. An annual address to Parliament is guaranteed.",
    clause: "Part 8; Cl 92\u201394",
    pull: "\u201cA relevant entity must respond to a question put to it\u2026 within the required period.\u201d",
    gov: "Question-and-answer powers mirror existing parliamentary committee practice and build accountability for outcomes into the system.",
    source: "Statewide Treaty Act 2025, Part 8"
  },
  {
    id: "identity",
    domain: "identity",
    label: "Who decides identity",
    general: "Citizenship and enrolment are defined by uniform law. No body certifies who you are.",
    fp: "Gellung Warl assumes functions relating to confirmation of Aboriginality, deciding who is recognised as a First Peoples person for the purposes of treaty structures.",
    clause: "Part 4, Div 5",
    pull: "\u201cFunctions\u2026 include developing processes for confirmations of Aboriginality\u2026\u201d",
    gov: "Communities are best placed to confirm their own membership, as has long been practice through Aboriginal community-controlled organisations.",
    source: "Statewide Treaty Act 2025, Part 4"
  },
  {
    id: "franchise",
    domain: "identity",
    label: "Two electoral rolls",
    general: "One vote, from age 18, on the single Victorian roll.",
    fp: "May also enrol on a separate First Peoples roll and vote in Gellung Warl elections from age 16 \u2014 a second democratic channel unavailable to other Victorians.",
    clause: "Part 3, Div 2",
    pull: "\u201cA person is entitled to enrol\u2026 if the person is a First Peoples person who has attained 16 years of age.\u201d",
    gov: "The roll only governs elections for Gellung Warl itself \u2014 a body with no power over non-Indigenous Victorians.",
    source: "Statewide Treaty Act 2025, Part 3"
  },
  {
    id: "naming",
    domain: "land",
    label: "Naming of places",
    general: "May lodge a suggestion with Geographic Names Victoria and wait in the queue.",
    fp: "Gellung Warl holds statutory authority in the process for naming and renaming geographic features and localities.",
    clause: "Part 4, Div 5",
    pull: "\u201cFunctions in relation to the naming\u2026 of geographic features\u2026 are conferred on Gellung Warl.\u201d",
    gov: "Naming functions are administrative, operate within existing naming rules, and recognise tens of thousands of years of connection to Country.",
    source: "Statewide Treaty Act 2025, Part 4; Geographic Names Victoria"
  },
  {
    id: "water",
    domain: "land",
    label: "Land and water interests",
    general: "Buys water entitlements on the open market at market price, under general water law.",
    fp: "The treaty framework commits to growing First Peoples\u2019 water holdings and embeds consultation guidelines across land and water decision-making.",
    clause: "Treaty sch.; Part 6",
    pull: "\u201c\u2026supporting First Peoples\u2019 access to, and ownership of, water entitlements\u2026\u201d",
    gov: "Water commitments are delivered through existing budget processes and purchases on the open market \u2014 no one\u2019s entitlement is taken.",
    source: "Statewide Treaty 2025 schedules"
  },
  {
    id: "culture",
    domain: "culture",
    label: "Culture and curriculum",
    general: "School curriculum is set by the VCAA for all students; parents make submissions like anyone else.",
    fp: "The Act establishes Nyerna Yoorrook Telkuna, an ongoing truth-telling body, and gives treaty structures a formal role in shaping how Victorian history and culture are taught and commemorated.",
    clause: "Part 5",
    pull: "\u201cNyerna Yoorrook Telkuna is established\u2026 to continue truth-telling\u2026\u201d",
    gov: "Truth-telling continues the evidence-gathering work of the Yoorrook Justice Commission. Curriculum remains set by the VCAA under existing law.",
    source: "Statewide Treaty Act 2025, Part 5"
  },
  {
    id: "funding",
    domain: "funding",
    label: "Guaranteed public funding",
    general: "Public services are funded through annual budgets that any government may change.",
    fp: "Gellung Warl and treaty bodies receive ongoing statutory funding under the treaty, insulated from normal budget review, with reported costs rising over the forward estimates.",
    clause: "Part 9; Treaty sch.",
    pull: "\u201cThe State must provide funding\u2026 to enable Gellung Warl to perform its functions.\u201d",
    gov: "Funding is modest against a $100B+ state budget, is acquitted through the normal audit framework, and replaces programs that were failing to close the gap.",
    source: "Statewide Treaty Act 2025, Part 9; Budget papers",
    contested: true
  },
  {
    id: "oversight",
    domain: "lawmaking",
    label: "Holding government to account",
    general: "Votes once every four years; may petition, FOI, or complain to the Ombudsman.",
    fp: "Nginma Ngainga Wara, a dedicated accountability body, monitors government against treaty obligations and can compel responses and refer failures for action.",
    clause: "Cl 92\u201394, 113",
    pull: "\u201cNginma Ngainga Wara may refer a matter\u2026 for inquiry or action.\u201d",
    gov: "An accountability mechanism was a recommendation of the Yoorrook Justice Commission; it reports publicly and creates no binding orders on Parliament.",
    source: "Statewide Treaty Act 2025, Part 8"
  }
];

window.TV_DOMAINS = [
  { key: "all", label: "All ten" },
  { key: "lawmaking", label: "Lawmaking" },
  { key: "identity", label: "Identity" },
  { key: "land", label: "Land and water" },
  { key: "culture", label: "Culture" },
  { key: "funding", label: "Funding" }
];
