import { Router, Response } from "express";
import prisma from "../config/prisma.js";
import { protectAdmin, AdminRequest } from "../middleware/auth.js";
import { randomUUID } from "crypto"; // for ProductImage.id

const router = Router();

// GET /api/products
router.get("/", protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        Category: true,
        ProductVariant: true,
        ProductImage: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/products -> create product
router.post("/", protectAdmin, async (req: AdminRequest, res: Response) => {
  try {
    // matches React form: { title, slug, price, description, category }
    const { title, slug, price, description, category } = req.body;

    const name = title;
    const basePrice = price?.toString(); // Decimal as string

    // Map category string -> Gender enum
    let gender: "MEN" | "WOMEN" | "UNISEX" = "UNISEX";
    if (category === "men") gender = "MEN";
    else if (category === "women") gender = "WOMEN";

    // Map category string -> real Category.id
    let categoryId = "";
    if (category === "men") {
      categoryId = "cmnwq15zl0000lniwzewsvklg"; // Men
    } else if (category === "women") {
      categoryId = "cmnwq16h80001lniwtmqsiqgz"; // Women
    } else if (category === "accessories") {
      // TEMP: map accessories to Men until you create an accessories category
      categoryId = "cmnwq15zl0000lniwzewsvklg";
    }

    // Validation
    if (!name || !slug || !description || !basePrice || !categoryId || !gender) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDesc: description,
        basePrice,
        categoryId,
        tag: "CORE",
        gender,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error("Create product error:", error);

    // Handle duplicate slug nicely
    if (error.code === "P2002" && Array.isArray(error.meta?.target) && error.meta.target.includes("slug")) {
      return res.status(400).json({ message: "Slug must be unique" });
    }

    res.status(400).json({ message: "Create product failed" });
  }
});

// PATCH /api/products/:id/status
router.patch(
  "/:id/status",
  protectAdmin,
  async (req: AdminRequest, res: Response) => {
    try {
      const { isActive, isFeatured } = req.body;
      const product = await prisma.product.update({
        where: { id: String(req.params.id) },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(isFeatured !== undefined && { isFeatured }),
        },
      });
      res.json(product);
    } catch (error) {
      console.error("Update status error:", error);
      res.status(400).json({ message: "Update failed" });
    }
  }
);

// DELETE /api/products/:id
router.delete(
  "/:id",
  protectAdmin,
  async (req: AdminRequest, res: Response) => {
    try {
      await prisma.product.delete({
        where: { id: String(req.params.id) },
      });
      res.status(204).send();
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(400).json({ message: "Delete product failed" });
    }
  }
);

// POST /api/products/:id/variants -> add sizes/colors
router.post(
  "/:id/variants",
  protectAdmin,
  async (req: AdminRequest, res: Response) => {
    try {
      const {
        sizes,
        color,
        colorHex,
        priceOverride,
        stock,
      } = req.body as {
        sizes: string[];
        color: string;
        colorHex?: string;
        priceOverride?: string;
        stock?: number;
      };

      if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
        return res.status(400).json({ message: "Sizes array is required" });
      }

      const productId = String(req.params.id);

      const created = await Promise.all(
        sizes.map((size) =>
          prisma.productVariant.create({
            data: {
              id: randomUUID(),                       // required
              productId,
              size,
              color,
              colorHex: colorHex ?? null,
              sku: `${productId}-${size}-${color}`,   // simple unique sku
              stock: stock ?? 0,
              reservedStock: 0,
              lowStockAlert: 5,
              priceOverride: priceOverride ?? null,   // ok, it's Decimal?
              createdAt: new Date(),
              updatedAt: new Date(),                  // required
            },
          })
        )
      );

      res.status(201).json(created);
    } catch (error) {
      console.error("Add variants error:", error);
      res.status(400).json({ message: "Add variants failed" });
    }
  }
);

// POST /api/products/:id/images -> attach multiple images (first is cover)
router.post(
  "/:id/images",
  protectAdmin,
  async (req: AdminRequest, res: Response) => {
    try {
      const { images } = req.body as {
        images: { url: string; alt?: string }[];
      };

      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      const productId = String(req.params.id);

      const created = await Promise.all(
        images.map((img, index) =>
          prisma.productImage.create({
            data: {
              id: randomUUID(),          // required because ProductImage.id has no default
              productId,
              url: img.url,
              alt: img.alt ?? null,
              position: index,           // 0 = cover image
            },
          })
        )
      );

      res.status(201).json(created);
    } catch (error) {
      console.error("Add image error:", error);
      res.status(400).json({ message: "Add image failed" });
    }
  }
);

export default router;