import * as React from "react"
import type {
  FieldError,
  FieldValues,
  UseFormProps,
  UseFormReturn} from "react-hook-form";
import {
  useForm as useHookForm,
  useFormContext as useHookFormContext
} from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import type { ExecutionResult } from "graphql"

import type Yup from "../yup"
import type { MutationHandler} from "./useMutationHandler";
import { useMutationHandler } from "./useMutationHandler"

interface Props<T extends FieldValues> extends UseFormProps<T> {
  schema?: Yup.ObjectSchema<any>
}
export function useForm<T extends Record<string, any>>(props?: Props<T>) {
  const [appError, setAppError] = React.useState<string | null | undefined>()
  const mutationHandler = useMutationHandler()
  const form = useHookForm<T>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    resolver: props?.schema && yupResolver(props.schema),
    ...props,
  })

  const setFieldErrors = (errors: FieldError[]) =>
    errors.forEach((error) => form.setError(error.type as any, error))

  async function handler<T>(
    mutation: () => Promise<ExecutionResult<NonNullable<T>> | void>,
    handler?: MutationHandler<T>,
  ) {
    setAppError(null)
    return mutationHandler(mutation, handler, { setAppError, setFieldErrors })
  }

  return {
    ...form,
    appError,
    setAppError,
    handler,
    handleSubmit: form.handleSubmit as UseFormReturn<T>["handleSubmit"],
  }
}

export type UseAppFormContextOptions = UseFormReturn<any> & {
  appError?: string
}

export function useFormContext() {
  return useHookFormContext() as UseAppFormContextOptions
}
