import { render, screen } from '@testing-library/react';
import { TableCard } from '../../src/components/TableCard';
import type { Table } from '../../src/types';

describe('TableCard', () => {
  const mockTable: Table = {
    id: '1',
    tableNumber: '5',
    isActive: true,
    currentSessionId: 'session-1',
    totalAmount: 50000,
    orderCount: 3,
    lastOrderAt: '2026-02-25T12:00:00Z',
    orders: [
      {
        id: 'order-1',
        orderNumber: 'ORD-001',
        tableId: '1',
        tableNumber: '5',
        status: 'pending',
        items: [],
        totalAmount: 15000,
        createdAt: '2026-02-25T12:00:00Z',
        updatedAt: '2026-02-25T12:00:00Z',
        deletedAt: null,
        sessionId: 'session-1'
      }
    ]
  };

  it('should display table info', () => {
    render(<TableCard table={mockTable} isNew={false} onClick={() => {}} />);

    expect(screen.getByText('테이블 5')).toBeInTheDocument();
    expect(screen.getByText(/총 주문액: ₩50,000/)).toBeInTheDocument();
    expect(screen.getByText(/주문 수: 3/)).toBeInTheDocument();
  });

  it('should apply new-order class when isNew is true', () => {
    const { container } = render(<TableCard table={mockTable} isNew={true} onClick={() => {}} />);

    const card = container.querySelector('.table-card');
    expect(card).toHaveClass('new-order');
  });

  it('should apply active class for active table', () => {
    const { container } = render(<TableCard table={mockTable} isNew={false} onClick={() => {}} />);

    const card = container.querySelector('.table-card');
    expect(card).toHaveClass('active');
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<TableCard table={mockTable} isNew={false} onClick={handleClick} />);

    const card = screen.getByRole('button');
    card.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
