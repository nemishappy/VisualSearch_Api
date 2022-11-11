module.exports = (sequelize, type) => {
  return sequelize.define(
    "product",
    {
      id: {
        type: type.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      productName: type.STRING,
      imagePath: type.STRING,
      imageName: type.STRING,
      price: {
        type: type.INTEGER,
        defaultValue: 0,
      },
    },
    { timestamps: false }
  );
};
