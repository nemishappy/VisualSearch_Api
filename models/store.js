module.exports = (sequelize, type) => {
  return sequelize.define(
    "store",
    {
      id: {
        type: type.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      storeName: type.STRING,
      imagePath: type.STRING,
      imageName: type.STRING,
      logoPath: type.STRING,
      logoName: type.STRING,
    },
    { timestamps: false }
  );
};
