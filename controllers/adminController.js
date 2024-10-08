const User = require('../model/userModel');
const Budget = require('../model/budgetModel');
const Transaction = require('../model/transactionModel');
const Category = require('../model/categoryModel');

exports.getAllUser = async (req, res, next) => {
  try {
    const user = await User.find();
    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No user Found',
      });
    }

    res.status(200).json({
      status: 'success',
      result: user.length,
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { email, active, userName, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        email: req.body.email,
        active: req.body.active,
        role: req.body.role,
        userName: req.body.userName,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'No user Found with that id',
      });
    }

    res.status(201).json({
      status: 'successs',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  //Get the user By Id
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({
      status: 'Failed',
      message: `No user with that id ${req.params.id}`,
    });
  }

  res.status(204).json({
    status: 'Failed',
    data: null,
  });
};

exports.getUserProfile = async (req, res, next) => {
  try {
    // Fetch the user by ID
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Fetch user's budget
    const budget = await Budget.findOne({ userId: req.params.userId });

    // Fetch user's transactions
    const transactions = await Transaction.find({ userId: req.params.userId });

    // Check if budget exists
    const budgetMessage = budget ? budget : 'User has no budget.';

    // Check if transactions exist
    const transactionMessage =
      transactions.length > 0 ? transactions : 'User has no transactions.';

    res.status(200).json({
      status: 'success',
      data: {
        user, // User profile data
        budget: budgetMessage, // User's budget or message
        transactions: transactionMessage, // User's transactions or message
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getAdminTransactionSummary = async (req, res) => {
  try {
    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Aggregation pipeline for monthly summary across all users
    const monthlySummary = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 }, // Count total transactions
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0], // Sum expenses
            },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0], // Sum income
            },
          },
        },
      },
    ]);

    // If no transactions exist for the current month
    if (monthlySummary.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalTransactions: 0,
          totalExpenses: 0,
          totalIncome: 0,
          message: 'No transactions found for the current month.',
        },
      });
    }

    // Send the aggregated data back
    res.status(200).json({
      status: 'success',
      data: {
        totalTransactions: monthlySummary[0].totalTransactions,
        totalIncome: monthlySummary[0].totalIncome,
        totalExpenses: monthlySummary[0].totalExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getUserTransactionSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get the start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Aggregation pipeline for a specific user's monthly summary
    const userSummary = await Transaction.aggregate([
      {
        $match: {
          userId: userId, // Filter by the provided user's ID
          date: {
            $gte: startOfMonth, // Transactions for the current month
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 }, // Count total transactions
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0], // Sum of expenses
            },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0], // Sum of income
            },
          },
        },
      },
    ]);

    // If no transactions exist for this user in the current month
    if (userSummary.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalTransactions: 0,
          totalExpenses: 0,
          totalIncome: 0,
          message: 'No transactions found for this user in the current month.',
        },
      });
    }

    // Send the aggregated data back for the user
    res.status(200).json({
      status: 'success',
      data: {
        totalTransactions: userSummary[0].totalTransactions,
        totalIncome: userSummary[0].totalIncome,
        totalExpenses: userSummary[0].totalExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getAllcategory = async (req, res, next) => {
  try {
    const category = await Category.find();
    if (!category) {
      return res.status(200).json({
        status: 'Failed',
        message: 'No Category Avaliable Now',
      });
    }
    res.status(200).json({
      status: 'Success',
      data: category,
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getAllBudget = async (req, res, next) => {
  try {
    const budget = await Budget.find();
    if (!budget) {
      return res.status(200).json({
        status: 'Failed',
        message: 'No budget Avaliable Now',
      });
    }
    res.status(200).json({
      status: 'Success',
      data: {
        budget,
      },
    });
  } catch (error) {}
};

// Controller for admin to verify KYC documents
exports.verifyKYC = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId, { new: true });
    if (!user) {
      return res
        .status(404)
        .json({ status: 'Fail', message: 'User not found' });
    }
    user.kyc.isVerified = true;
    user.kyc.verificationDate = Date.now();
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: 'KYC documents verified successfully',
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
