-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('product', 'shipping');

-- CreateTable
CREATE TABLE "cart" (
    "id" SERIAL NOT NULL,
    "member_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" DECIMAL NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL NOT NULL,
    "expires_at" TIMESTAMP(6),

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_discount" (
    "cartId" INTEGER NOT NULL,
    "discountId" INTEGER NOT NULL,

    CONSTRAINT "cart_discount_pkey" PRIMARY KEY ("cartId","discountId")
);

-- CreateTable
CREATE TABLE "order_discount" (
    "orderId" INTEGER NOT NULL,
    "discountId" INTEGER NOT NULL,

    CONSTRAINT "order_discount_pkey" PRIMARY KEY ("orderId","discountId")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_key" ON "discount"("code");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_discount" ADD CONSTRAINT "cart_discount_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_discount" ADD CONSTRAINT "cart_discount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_discount" ADD CONSTRAINT "order_discount_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sale_order"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_discount" ADD CONSTRAINT "order_discount_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
