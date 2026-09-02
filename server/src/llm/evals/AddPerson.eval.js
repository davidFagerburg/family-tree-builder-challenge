import "dotenv/config"

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getChatReply } from '../client.js'; 

const mockFindPerson = vi.fn();
const mockAddPerson = vi.fn();

vi.mock('../../service/FamilyService.js', () => {
  return {
    default: {
      findPerson: (...args) => mockFindPerson(...args),
      addPerson: (...args) => mockAddPerson(...args),
    },
  };
});

describe('add_person Tool Eval Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockFindPerson.mockResolvedValue([]);
    mockAddPerson.mockResolvedValue({ id: 1, name: 'Fallback' });
  });

  it('triggers add_person tool with correct schema for a new user', async () => {
    mockFindPerson.mockResolvedValue([]);
    mockAddPerson.mockResolvedValue({ id: 1, name: 'Alice' });

    const messages = [{ role: 'user', content: 'Please add Alice to my family tree.' }];
    
    const reply = await getChatReply(messages);

    expect(mockFindPerson).toHaveBeenCalledWith({ name: 'Alice' });
    expect(mockAddPerson).toHaveBeenCalledWith('Alice');
    expect(reply.toLowerCase()).toContain('alice');
  });

  it('blocks duplicate names and surfaces the exception cleanly', async () => {
    mockFindPerson.mockResolvedValue([{ id: 2, name: 'Bob' }]);

    const messages = [{ role: 'user', content: 'Add Bob to the tree.' }];
    
    const reply = await getChatReply(messages);

    expect(mockFindPerson).toHaveBeenCalledWith({ name: 'Bob' });
    expect(mockAddPerson).not.toHaveBeenCalled();
    expect(reply.length).toBeGreaterThan(0);
  });

  it('tactfully rejects unsupported structures like half-siblings', async () => {
    const messages = [
      { role: 'user', content: 'Can you add my half-brother Jack to the family tree?' }
    ];

    await getChatReply(messages);

    expect(mockFindPerson).not.toHaveBeenCalled();
    expect(mockAddPerson).not.toHaveBeenCalled();
  });
});
