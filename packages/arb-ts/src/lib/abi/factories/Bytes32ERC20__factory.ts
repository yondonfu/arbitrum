/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from 'ethers'
import { Provider, TransactionRequest } from '@ethersproject/providers'
import type { Bytes32ERC20, Bytes32ERC20Interface } from '../Bytes32ERC20'

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'guy',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'wad',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'dst',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'wad',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'src',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'dst',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'wad',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const _bytecode =
  '0x608060405234801561001057600080fd5b506102ae806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c8063095ea7b3146100675780631249c58b146100a757806323b872dd146100b157806370a08231146100e7578063a9059cbb1461011f578063dd62ed3e1461014b575b600080fd5b6100936004803603604081101561007d57600080fd5b506001600160a01b038135169060200135610179565b604080519115158252519081900360200190f35b6100af6101a3565b005b610093600480360360608110156100c757600080fd5b506001600160a01b038135811691602081013590911690604001356101c2565b61010d600480360360208110156100fd57600080fd5b50356001600160a01b0316610235565b60408051918252519081900360200190f35b6100936004803603604081101561013557600080fd5b506001600160a01b038135169060200135610247565b61010d6004803603604081101561016157600080fd5b506001600160a01b038135811691602001351661025b565b3360009081526001602081815260408084206001600160a01b039690961684529490529290205590565b3360009081526020819052604090208054670de0b6b3a7640000019055565b60006001600160a01b03841633146101ff576001600160a01b03841660009081526001602090815260408083203384529091529020805483900390555b506001600160a01b0392831660009081526020819052604080822080548490039055929093168352912080549091019055600190565b60006020819052908152604090205481565b60006102543384846101c2565b9392505050565b60016020908152600092835260408084209091529082529020548156fea2646970667358221220cbf68de91d24d64650b3cd108c8c9a289d83e7906e85907336fb25dcdde992a864736f6c634300060b0033'

export class Bytes32ERC20__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer)
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Bytes32ERC20> {
    return super.deploy(overrides || {}) as Promise<Bytes32ERC20>
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {})
  }
  attach(address: string): Bytes32ERC20 {
    return super.attach(address) as Bytes32ERC20
  }
  connect(signer: Signer): Bytes32ERC20__factory {
    return super.connect(signer) as Bytes32ERC20__factory
  }
  static readonly bytecode = _bytecode
  static readonly abi = _abi
  static createInterface(): Bytes32ERC20Interface {
    return new utils.Interface(_abi) as Bytes32ERC20Interface
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Bytes32ERC20 {
    return new Contract(address, _abi, signerOrProvider) as Bytes32ERC20
  }
}