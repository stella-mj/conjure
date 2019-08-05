import * as React from "react"
import TextWithLabel from "./TextWithLabel"
import SelectWithLabel from "./SelectWithLabel"
import StageHeader from "../common/StageHeader"
import { Check } from "../common/Check"

import {
  Form,
  Field,
  FieldArray,
  FieldProps,
  Formik,
  FormikProps
} from "formik"

import { VarRepresentation } from "../../../../extension/src/utils"

interface Props {
  varRepresentations: VarRepresentation[]
  index: number
  showReps: boolean[]
  showRepsHandler: () => void
}

interface ConjureConfig {
  conjureTime: number
  strategy: string
  answers: (string | undefined)[]
}

interface Values {
  config: ConjureConfig
}

export const ConjureStage = (
  props: Props & FormikProps<Values> & FieldProps<any>
) => {
  const { index, showReps, showRepsHandler, varRepresentations, values } = props
  const { name } = props.field

  const repSelectBoxes = varRepresentations.map(x => {
    const options = x.representations.map(x => {
      return {
        value: x.answer,
        label: x.description
      }
    })

    return (
      <Field
        name={`${name}.answers[${index}]`}
        component={SelectWithLabel}
        title={x.name}
        options={options}
        values={values.config.answers[index]}
      />
    )
  })

  return (
    <StageHeader title="Conjure" id={`conjure${index + 1}`} isCollapsed={true}>
      <Field
        name={`${name}.conjureTime`}
        component={TextWithLabel}
        title={"Time limit"}
        values={values.config.conjureTime}
      />
      <>
        {!showReps[index] && (
          <Field
            name={`${name}.strategy`}
            component={SelectWithLabel}
            title="Strategy"
            options={[
              { value: "", label: "Default" },
              { value: "c", label: "compact" },
              { value: "s", label: "sparse" }
            ]}
            values={values.config.strategy}
          />
        )}
      </>
      <Check
        title={"Choose Representation"}
        checked={showReps[index]}
        onChange={showRepsHandler}
      />
      {showReps[index] && repSelectBoxes}
      {}
    </StageHeader>
  )
}
