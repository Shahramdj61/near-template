import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import { transactions, utils } from 'near-api-js'
import { JsonRpcProvider } from 'near-api-js/lib/providers'
import { useState } from 'react'
import './App.css'
import { NightlyWalletAdapter } from './nightly'
import { NearAccount } from './types'
const NightlyNear = new NightlyWalletAdapter()
function App() {
  const [nearAccount, setnearAccount] = useState<NearAccount | undefined>(undefined)
  console.log(nearAccount?.publicKey.toString())
  return (
    <div className='App'>
      <header className='App-header'>
        <Typography>
          {nearAccount ? `Hello, ${nearAccount?.accountId}` : 'Hello, stranger'}
        </Typography>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            const value = await NightlyNear.connect(() => {
              console.log('Trigger disconnect Near')
              setnearAccount(undefined)
            })
            setnearAccount(value)
          }}
        >
          Connect Near
        </Button>{' '}
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            if (!nearAccount) return
            const provider = new JsonRpcProvider({ url: 'https://rpc.testnet.near.org' })
            const blockInfo = await provider.query(
              `access_key/${nearAccount.accountId}/${
                nearAccount.publicKey.toString().split(':')[1]
              }`,
              ''
            )
            const blockHash = utils.serialize.base_decode(blockInfo.block_hash)
            const action = transactions.transfer(utils.format.parseNearAmount('0.0001'))

            const tx = transactions.createTransaction(
              nearAccount.accountId,
              nearAccount.publicKey,
              'norbert.testnet',
              // @ts-expect-error
              ++blockInfo.nonce,
              [action],
              blockHash
            )
            const signedTx = await NightlyNear.signTransaction(tx)
            const id = (await provider.sendTransactionAsync(signedTx)) as unknown as string
            console.log(id)
          }}
        >
          Send test 0.0001 Near
        </Button>
        <Button
          variant='contained'
          style={{ margin: 10 }}
          onClick={async () => {
            await NightlyNear.disconnect()
          }}
        >
          Disconnect Near
        </Button>
      </header>
    </div>
  )
}

export default App
