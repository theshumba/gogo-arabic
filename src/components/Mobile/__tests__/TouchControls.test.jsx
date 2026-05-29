import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TouchControls from '../TouchControls.jsx';
import { EventBus } from '../../../utils/eventBus.js';
import { EVENTS } from '../../../utils/eventBusTypes.js';

describe('TouchControls (103-03)', () => {
  it('renders an Interact button marked data-touch-control', () => {
    render(<TouchControls />);
    const btn = screen.getByLabelText('Interact');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('data-touch-control');
  });

  it('emits TOUCH_INTERACT when the button is pressed', () => {
    const spy = vi.spyOn(EventBus, 'emit');
    render(<TouchControls />);
    fireEvent.pointerDown(screen.getByLabelText('Interact'));
    expect(spy).toHaveBeenCalledWith(EVENTS.TOUCH_INTERACT);
    spy.mockRestore();
  });
});
