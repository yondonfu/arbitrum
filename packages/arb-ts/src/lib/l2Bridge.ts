/*
 * Copyright 2021, Offchain Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-env node */
'use strict'
import { Signer, BigNumber, providers, ethers } from 'ethers'
import { ArbSys } from './abi/ArbSys'
import { ArbSys__factory } from './abi/factories/ArbSys__factory'
import { StandardArbERC20 } from './abi/StandardArbERC20'
import { ICustomToken } from './abi/ICustomToken'
import { ICustomToken__factory } from './abi/factories/ICustomToken__factory'
import { L2GatewayRouter__factory } from './abi/factories/L2GatewayRouter__factory'
import { L2GatewayRouter } from './abi/L2GatewayRouter'
import { L2ERC20Gateway } from './abi/L2ERC20Gateway'

import { StandardArbERC20__factory } from './abi/factories/StandardArbERC20__factory'
import { IArbToken } from './abi/IArbToken'
import { IArbToken__factory } from './abi/factories/IArbToken__factory'
import { ArbRetryableTx__factory } from './abi/factories/ArbRetryableTx__factory'
import { ArbRetryableTx } from './abi/ArbRetryableTx'
import { PayableOverrides } from '@ethersproject/contracts'

import {
  ARB_SYS_ADDRESS,
  ARB_RETRYABLE_TX_ADDRESS,
} from './precompile_addresses'

export interface L2TokenData {
  ERC20?: { contract: StandardArbERC20; balance: BigNumber }
  CUSTOM?: { contract: ICustomToken; balance: BigNumber } // Here we don't use the particlar custom token's interface; for the sake of this sdk that's fine
}

export interface Tokens {
  [contractAddress: string]: L2TokenData | undefined
}
/**
 * L2 side only of {@link Bridge}
 */
export class L2Bridge {
  l2Signer: Signer
  arbSys: ArbSys
  l2GatewayRouter: L2GatewayRouter
  l2Tokens: Tokens
  l2Provider: providers.Provider
  l2EthBalance: BigNumber
  arbRetryableTx: ArbRetryableTx
  walletAddressCache?: string

  constructor(l2GatewayRouterAddress: string, l2Signer: Signer) {
    this.l2Tokens = {}

    this.l2Signer = l2Signer

    const l2Provider = l2Signer.provider

    if (l2Provider === undefined) {
      throw new Error('Signer must be connected to an (Arbitrum) provider')
    }
    this.l2Provider = l2Provider

    this.arbSys = ArbSys__factory.connect(ARB_SYS_ADDRESS, l2Signer)

    this.l2GatewayRouter = L2GatewayRouter__factory.connect(
      l2GatewayRouterAddress,
      l2Signer
    )

    this.arbRetryableTx = ArbRetryableTx__factory.connect(
      ARB_RETRYABLE_TX_ADDRESS,
      l2Signer
    )

    this.l2EthBalance = BigNumber.from(0)
  }

  /**
   * Initiate Ether withdrawal (via ArbSys)
   */
  public async withdrawETH(
    value: BigNumber,
    destinationAddress?: string,
    overrides?: PayableOverrides
  ) {
    const address = destinationAddress || (await this.getWalletAddress())
    return this.arbSys.functions.withdrawEth(address, {
      value,
      ...overrides,
    })
  }

  public getLatestBlock() {
    return this.l2Provider.getBlock('latest')
  }
  /**
   * Initiate token withdrawal (via l2ERC20Gateway)
   */
  public async withdrawERC20(
    erc20l1Address: string,
    amount: BigNumber,
    destinationAddress?: string,
    overrides: PayableOverrides = {}
  ) {
    const to = destinationAddress || (await this.getWalletAddress())

    return this.l2GatewayRouter.functions[
      'outboundTransfer(address,address,uint256,bytes)'
    ](erc20l1Address, to, amount, '0x', overrides)
  }

  public async updateAllL2Tokens() {
    for (const l1Address in this.l2Tokens) {
      const l2Address = this.l2Tokens[l1Address]?.ERC20?.contract.address
      if (l2Address) {
        await this.getAndUpdateL2TokenData(l1Address, l2Address)
      }
    }
    return this.l2Tokens
  }

  public async getAndUpdateL2TokenData(
    erc20L1Address: string,
    l2ERC20Address: string
  ) {
    const tokenData = this.l2Tokens[erc20L1Address] || {
      ERC20: undefined,
      CUSTOM: undefined,
    }
    this.l2Tokens[erc20L1Address] = tokenData
    const walletAddress = await this.getWalletAddress()

    // check if standard arb erc20:
    if (!tokenData.ERC20) {
      if ((await this.l2Provider.getCode(l2ERC20Address)).length > 2) {
        const arbERC20TokenContract = await StandardArbERC20__factory.connect(
          l2ERC20Address,
          this.l2Signer
        )
        const [balance] = await arbERC20TokenContract.functions.balanceOf(
          walletAddress
        )
        tokenData.ERC20 = {
          contract: arbERC20TokenContract,
          balance,
        }
      } else {
        console.info(
          `Corresponding ArbERC20 for ${erc20L1Address} not yet deployed (would be at ${l2ERC20Address})`
        )
      }
    } else {
      const arbERC20TokenContract = await StandardArbERC20__factory.connect(
        l2ERC20Address,
        this.l2Signer
      )
      const [balance] = await arbERC20TokenContract.functions.balanceOf(
        walletAddress
      )
      tokenData.ERC20.balance = balance
    }

    if (tokenData.ERC20 || tokenData.CUSTOM) {
      return tokenData
    } else {
      console.warn(`No L2 token for ${erc20L1Address} found`)
      return
    }
  }

  // public getERC20L2Address(erc20L1Address: string) {
  //   let address: string | undefined
  //   if ((address = this.l2Tokens[erc20L1Address]?.ERC20?.contract.address)) {
  //     return address
  //   }
  //   return this.l2GatewayRouter.functions
  //     .calculateL2TokenAddress(erc20L1Address)
  //     .then(([res]) => res)
  // }

  public async getGatewayAddress(erc20L1Address: string) {
    return (await this.l2GatewayRouter.functions.getGateway(erc20L1Address))
      .gateway
  }

  public getERC20L1Address(erc20L2Address: string) {
    try {
      const arbERC20 = StandardArbERC20__factory.connect(
        erc20L2Address,
        this.l2Signer
      )
      return arbERC20.functions.l1Address().then(([res]) => res)
    } catch (e) {
      console.warn('Could not get L1 Address')

      return undefined
    }
  }

  public getTxnSubmissionPrice(dataSize: BigNumber | number) {
    return this.arbRetryableTx.functions.getSubmissionPrice(dataSize)
  }

  public async getWalletAddress() {
    if (this.walletAddressCache) {
      return this.walletAddressCache
    }
    this.walletAddressCache = await this.l2Signer.getAddress()
    return this.walletAddressCache
  }

  public async getAndUpdateL2EthBalance(): Promise<BigNumber> {
    const bal = await this.l2Signer.getBalance()
    this.l2EthBalance = bal
    return bal
  }
}
