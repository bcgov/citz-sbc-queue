export type UseDialogOptions = {
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	onOpen?: () => void;
	onClose?: () => void;
};

export type UseDialogReturn = {
	open: boolean;
	setOpen: (next: boolean) => void;
	openDialog: () => void;
	closeDialog: () => void;
};
