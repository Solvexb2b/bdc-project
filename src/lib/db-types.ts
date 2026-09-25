// Auto-generated from your database schema — do not edit by hand.
// Regenerates automatically whenever a table is created or altered.

export type ContractsRow = {
  id: string
  prospectId: string
  companyName: string
  grossRevenue: number | string
  taxLiability: number | string
  netRevenue: number | string
  eftpsTraceId: string | null
  status: string
  provisioningId: string | null
  userId: string
  signedAt: string
  createdAt: string
}

export type OutreachMessagesRow = {
  id: string
  runId: string
  userId: string
  companyName: string
  contactName: string | null
  contactEmail: string | null
  painPoint: string
  estimatedImpact: string
  evidence: string
  subject: string
  body: string
  status: string
  providerMessageId: string | null
  lastError: string | null
  createdAt: string
  updatedAt: string
}

export type OutreachProspectsRow = {
  id: string
  companyName: string
  sector: string | null
  region: string | null
  stage: string
  inefficiency: string | null
  proposedStrategy: string | null
  complianceChecked: string | null
  estimatedRoiSavings: number | string
  dynamicCalculatedPrice: number | string
  initialContactTemplate: string | null
  probability: number | string
  lastAction: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export type OutreachRepliesRow = {
  id: string
  messageId: string
  runId: string
  userId: string
  senderEmail: string
  subject: string
  body: string
  receivedAt: string
  notificationSent: number | string
}

export type OutreachRunsRow = {
  id: string
  userId: string
  objective: string
  sector: string
  region: string
  status: string
  findings: string
  createdAt: string
  updatedAt: string
}

export type ProvisioningLedgerRow = {
  id: string
  buyerId: string
  blueprintId: string
  tier: string
  specifications: string
  status: string
  deploymentHash: string | null
  outreachDispatched: number | string
  deploymentLog: string
  companyName: string | null
  contactEmail: string | null
  createdAt: string
  updatedAt: string
}

export type SystemMilestonesRow = {
  id: string
  lamportTimestamp: number | string
  actionType: string
  details: string
  userId: string
  createdAt: string
}

export type UsersRow = {
  id: string
  email: string
  emailVerified: number | string | null
  displayName: string | null
  avatarUrl: string | null
  phone: string | null
  phoneVerified: number | string | null
  role: string | null
  metadata: string | null
  createdAt: string
  updatedAt: string
  lastSignIn: string
}
