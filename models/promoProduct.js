module.exports = (sequelize, type) => {
  return sequelize.define(
    "PromoProduct",
    {
      id: {
        type: type.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      tittle: type.STRING,
      promotionPrice: {
        type: type.INTEGER,
        defaultValue: 0,
      },
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
