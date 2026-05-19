// Checks how many requests a user has sent in the last 7 days
// Usage: await checkWeeklyLimit(Model, senderId, limit)

const weekAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

const checkWeeklyLimit = async (Model, senderId, limit) => {
  const count = await Model.countDocuments({
    sender: senderId,
    createdAt: { $gte: weekAgo() },
  });
  return { count, exceeded: count >= limit };
};

module.exports = { checkWeeklyLimit };