import mongoose, { Schema, InferSchemaType } from "mongoose";

const StepSchema = new Schema(
  {
    tool:   { type: String, required: true },
    input:  { type: Schema.Types.Mixed, required: true },
    output: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false },
);

const AgentTraceSchema = new Schema(
  {
    applicationId:  { type: String, required: true, index: true },
    applicant_name: { type: String, required: true },
    requested_loan: { type: Number, required: true },
    purpose:        { type: String, required: true },
    verdict:        { type: String, required: true, index: true },
    financial_score:{ type: Number, required: true },
    dti_ratio:      { type: Number, required: true },
    iterations:     { type: Number, required: true },
    duration_ms:    { type: Number, required: true },
    steps:          { type: [StepSchema], required: true },
    summary:        { type: String, default: "" },
    llm_model:      { type: String, required: true },
    created_at:     { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export type AgentTraceDoc = InferSchemaType<typeof AgentTraceSchema>;
export const AgentTrace = mongoose.model("AgentTrace", AgentTraceSchema);
