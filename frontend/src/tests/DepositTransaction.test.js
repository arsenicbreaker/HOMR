import { describe, expect, it } from 'vitest';
import { deposit, STORAGE_DEPOSIT } from '../near/contracts';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

/**
 * Guards the shape the Wallet Selector hands to a wallet module. A v10
 * `meteor-wallet` module received these internal actions and threw
 * "Unsupported NAJ action", so keep the payload pinned here.
 */
function captureSigner() {
  const calls = [];
  return {
    calls,
    async signAndSendTransaction(params) {
      calls.push(params);
      return { transaction: { hash: 'deposit-tx-hash' } };
    },
  };
}

describe('vault deposit action payload', () => {
  it('calls ft_transfer_call on the token contract with the vault as receiver', async () => {
    const signer = captureSigner();
    const result = await deposit(signer, '100');

    expect(signer.calls).toHaveLength(1);
    const { receiverId, actions } = signer.calls[0];

    expect(receiverId).toBe(CONTRACT_ADDRESSES.MockUSDC);
    expect(receiverId).toBe('mock-token.funnylace8065.testnet');
    expect(actions).toHaveLength(1);

    const [action] = actions;
    expect(action.type).toBe('FunctionCall');
    expect(action.params.methodName).toBe('ft_transfer_call');
    expect(action.params.args).toEqual({
      receiver_id: 'housing-vault.funnylace8065.testnet',
      amount: '100000000',
      msg: '',
    });

    // Tokens and gas must be decimal strings: BigInt in the payload is what a
    // wallet module cannot serialise.
    expect(typeof action.params.gas).toBe('string');
    expect(typeof action.params.deposit).toBe('string');
    expect(action.params.gas).toMatch(/^\d+$/);
    expect(action.params.deposit).toMatch(/^\d+$/);
    expect(action.params.deposit).toBe(STORAGE_DEPOSIT);

    expect(() => JSON.stringify(actions)).not.toThrow();
    expect(result.txHash).toBe('deposit-tx-hash');
  });

  it('converts the user amount to yocto units at 6 decimals', async () => {
    const signer = captureSigner();
    await deposit(signer, '12.5');
    expect(signer.calls[0].actions[0].params.args.amount).toBe('12500000');
  });

  it('rejects an amount that is not a positive decimal', async () => {
    const signer = captureSigner();
    expect(() => deposit(signer, '1.1234567')).toThrow(/at most 6 decimal places/);
    expect(() => deposit(signer, 'abc')).toThrow(/decimal amount/);
    expect(signer.calls).toHaveLength(0);
  });
});
