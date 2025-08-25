"use client";

import { Description as HeadlessDescription } from "@headlessui/react";
import type { ReactNode } from "react";
import { useMemo } from "react";

export type DialogDescriptionProps = {
	children: ReactNode;
	id?: string;
	className?: string;
};

/**
 * DialogDescription component for displaying the description content of a dialog.
 * @param {DialogDescriptionProps} props - Props for the dialog description component.
 */
export const DialogDescription = ({ children, id, className }: DialogDescriptionProps) => {
	const descriptionClasses = useMemo(() => {
		return [
			"mt-1 text-sm text-gray-600",
			`${className ?? ""}`
		].join(" ");
	}, [className]);

	return (
		<HeadlessDescription id={id} className={descriptionClasses}>
			{children}
		</HeadlessDescription>
	);
};
