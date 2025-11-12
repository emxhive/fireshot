<?php

namespace App\Shared\Enums;

enum AccountRole: string
{
    case DefaultAsset = 'defaultAsset';
    case SharedAsset = 'sharedAsset';
    case SavingAsset = 'savingAsset';
    case ExpenseAsset = 'expenseAsset';
    case RevenueAsset = 'revenueAsset';
    case LoanAsset = 'loanAsset';
    case LiabilityAsset = 'liabilityAsset';
    case CreditCard = 'creditCard';
    case CashWallet = 'cashWalletAsset';
}
