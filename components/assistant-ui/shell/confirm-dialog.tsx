"use client";

import type { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: "default" | "destructive";
	loading?: boolean;
	loadingLabel?: string;
	showCloseButton?: boolean;
	onConfirm: () => void | Promise<void>;
};

/** 通用确认弹窗，供控制台与管理操作复用。 */
export const ConfirmDialog: FC<ConfirmDialogProps> = ({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "确认",
	cancelLabel = "取消",
	confirmVariant = "default",
	loading = false,
	loadingLabel,
	showCloseButton = true,
	onConfirm,
}) => (
	<Dialog
		open={open}
		onOpenChange={(next) => {
			if (!loading) onOpenChange(next);
		}}
	>
		<DialogContent
			className="sm:max-w-md"
			showCloseButton={showCloseButton && !loading}
		>
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				{description ? (
					<DialogDescription>{description}</DialogDescription>
				) : null}
			</DialogHeader>
			<DialogFooter>
				<Button
					type="button"
					variant="outline"
					disabled={loading}
					onClick={() => onOpenChange(false)}
				>
					{cancelLabel}
				</Button>
				<Button
					type="button"
					variant={confirmVariant}
					disabled={loading}
					onClick={() => void onConfirm()}
				>
					{loading ? (loadingLabel ?? `${confirmLabel}…`) : confirmLabel}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);
