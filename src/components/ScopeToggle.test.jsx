import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ScopeToggle from './ScopeToggle'

describe('ScopeToggle', () => {
  it('supports custom left label and value for history me scope', () => {
    const onChange = vi.fn()

    render(
      <ScopeToggle
        value="group"
        onChange={onChange}
        groupName="Fellowship"
        leftLabel="Me"
        leftValue="me"
        rightValue="group"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Me' }))

    expect(onChange).toHaveBeenCalledWith('me')
  })

  it('disables the right-side group button when no group name exists', () => {
    render(
      <ScopeToggle
        value="group"
        onChange={vi.fn()}
        groupName={null}
        leftLabel="Me"
        leftValue="me"
        rightValue="group"
      />
    )

    expect(screen.getByRole('button', { name: 'Group' })).toBeDisabled()
  })
})
