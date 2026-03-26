import { TextField } from "#/components/fields/text-field";
import {
	createFormHookContexts,
	createFormHook,
} from "@tanstack/react-form-start";

export const { fieldContext, formContext, useFieldContext } =
	createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextField,
	},
	formComponents: {},
});
