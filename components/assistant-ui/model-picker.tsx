"use client";

import type { FC } from "react";
import { ProviderModelPicker } from "@/components/assistant-ui/providers/shared/model-picker";
import { cn } from "@/lib/utils";

export const ModelPicker: FC<{ className?: string }> = ({ className }) => (
  <ProviderModelPicker variant="default" className={className} />
);
