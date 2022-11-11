module.exports = (sequelize, type) => {
  return sequelize.define(
    "PromoStore",
    {
      id: {
        type: type.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      tittle: type.STRING,
      description: type.STRING,
      startDate: {
        type: type.DATE,
      },
      endDate: {
        type: type.DATE,
      },
    },
    { timestamps: false }
  );
};
