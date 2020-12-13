import React, { ButtonHTMLAttributes, MouseEvent, useState } from 'react'

export default function Button(props: ButtonHTMLAttributes<{}>) {
  const { onClick, disabled, ...rest } = props
  const [isDisabled, setIsDisabled] = useState<boolean | undefined>(disabled)
  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (onClick) {
      setIsDisabled(true)
      await onClick(e)
      setIsDisabled(false)
    }
  }
  return <button {...rest} disabled={isDisabled} onClick={handleClick} />
}
