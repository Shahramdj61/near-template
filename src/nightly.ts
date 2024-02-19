import { SignMessageParams } from '@near-wallet-selector/core'
import { AccountImportData, NearAccount, NearNightly, WalletAdapter } from './types'
import {
  SignedTransaction as NearSignedTransaction,
  Transaction as NearTransaction
} from 'near-api-js/lib/transaction'
import { PublicKey } from 'near-api-js/lib/utils'

const DEFAULT_NEAR_PUBLIC_KEY = PublicKey.from('11111111111111111111111111111111')

export class NightlyWalletAdapter implements WalletAdapter {
  account: NearAccount
  _connected: boolean
  constructor() {
    this._connected = false
    this.account = { accountId: '', publicKey: DEFAULT_NEAR_PUBLIC_KEY }
  }

  get connected() {
    return this._connected
  }

  public async signAllTransactions(
    transactions: NearTransaction[]
  ): Promise<NearSignedTransaction[]> {
    return await this._provider.signAllTransactions(transactions)
  }

  private get _provider(): NearNightly {
    if ((window as any)?.nightly.near) {
      return (window as any).nightly.near
    } else {
      throw new Error('Nightly: near is not defined')
    }
  }

  async signTransaction(transaction: NearTransaction) {
    return await this._provider.signTransaction(transaction)
  }
  async signMessage(msg: SignMessageParams) {
    return await this._provider.signMessage(msg)
  }

  async connect(onDisconnect?: () => void) {
    try {
      const acc = await this._provider.connect(onDisconnect)
      this.account = {
        accountId: acc.accountId,
        // There might be problem with the public key thats why we parse it to local version
        publicKey: PublicKey.from(acc.publicKey.toString())
      }
      this._connected = true
      return this.account
    } catch (error) {
      console.log(error)
      throw new Error('User refused connection')
    }
  }

  async disconnect() {
    if (this.account.accountId !== '') {
      await this._provider.disconnect()
      this.account = { accountId: '', publicKey: DEFAULT_NEAR_PUBLIC_KEY }
      this._connected = false
    }
  }
  async importWalletsNear(accounts: AccountImportData[]) {
    return await this._provider.importWalletsNear(accounts)
  }
}
