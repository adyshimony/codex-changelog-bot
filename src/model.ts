export interface AnthropicModelInfo {
  id: string;
  display_name?: string | null;
}

export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const PREFERRED_ANTHROPIC_MODELS = [
  "claude-sonnet-4-6",
  "claude-sonnet-4-5",
  DEFAULT_ANTHROPIC_MODEL,
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
];

export function pickAnthropicModel(
  availableModels: AnthropicModelInfo[],
  configuredModel?: string
): string {
  const modelOverride = configuredModel?.trim();
  if (modelOverride) {
    return modelOverride;
  }

  const availableModelIds = new Set(availableModels.map((model) => model.id));
  for (const preferredModel of PREFERRED_ANTHROPIC_MODELS) {
    if (availableModelIds.has(preferredModel)) {
      return preferredModel;
    }
  }

  const sonnetModel = availableModels.find((model) =>
    /sonnet/i.test(`${model.id} ${model.display_name || ""}`)
  );
  if (sonnetModel) {
    return sonnetModel.id;
  }

  return availableModels[0]?.id || DEFAULT_ANTHROPIC_MODEL;
}
