import { cache } from "react";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const vehicleCardInclude = {
  modelYear: {
    include: {
      generation: {
        include: { model: { include: { manufacturer: true } } },
      },
    },
  },
  engine: true,
  performance: true,
  images: { orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.VehicleInclude;

export type VehicleCardData = Prisma.VehicleGetPayload<{
  include: typeof vehicleCardInclude;
}>;

const vehicleDetailInclude = {
  modelYear: {
    include: {
      generation: {
        include: { model: { include: { manufacturer: true } } },
      },
    },
  },
  engine: true,
  transmission: true,
  dimensions: true,
  performance: true,
  fuelEconomy: true,
  prices: { orderBy: [{ type: "asc" }, { effectiveAt: "desc" }] },
  images: { include: { source: true }, orderBy: { position: "asc" } },
} satisfies Prisma.VehicleInclude;

export const getPublishedVehicleCards = cache(async (take?: number) =>
  prisma.vehicle.findMany({
    where: { status: "PUBLISHED" },
    include: vehicleCardInclude,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    ...(take ? { take } : {}),
  }),
);

export const getManufacturerIndex = cache(async () =>
  prisma.manufacturer.findMany({
    where: {
      models: {
        some: {
          generations: {
            some: {
              modelYears: { some: { vehicles: { some: { status: "PUBLISHED" } } } },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      country: true,
      foundedIn: true,
      _count: { select: { models: true } },
    },
    orderBy: { name: "asc" },
  }),
);

export const getManufacturerBySlug = cache(async (slug: string) =>
  prisma.manufacturer.findUnique({
    where: { slug },
    include: {
      models: {
        where: {
          generations: {
            some: {
              modelYears: { some: { vehicles: { some: { status: "PUBLISHED" } } } },
            },
          },
        },
        include: {
          generations: {
            where: {
              modelYears: { some: { vehicles: { some: { status: "PUBLISHED" } } } },
            },
            include: {
              modelYears: {
                where: { vehicles: { some: { status: "PUBLISHED" } } },
                include: {
                  vehicles: {
                    where: { status: "PUBLISHED" },
                    include: vehicleCardInclude,
                    orderBy: { name: "asc" },
                  },
                },
                orderBy: { year: "desc" },
              },
            },
            orderBy: { code: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  }),
);

export const getModelByManufacturerAndSlug = cache(
  async (manufacturerSlug: string, modelSlug: string) =>
    prisma.vehicleModel.findFirst({
      where: { slug: modelSlug, manufacturer: { slug: manufacturerSlug } },
      include: {
        manufacturer: true,
        generations: {
          where: {
            modelYears: { some: { vehicles: { some: { status: "PUBLISHED" } } } },
          },
          include: {
            modelYears: {
              where: { vehicles: { some: { status: "PUBLISHED" } } },
              include: {
                vehicles: {
                  where: { status: "PUBLISHED" },
                  include: vehicleCardInclude,
                  orderBy: { name: "asc" },
                },
              },
              orderBy: { year: "desc" },
            },
          },
          orderBy: { code: "asc" },
        },
      },
    }),
);

export const getVehicleBySlug = cache(async (slug: string) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: vehicleDetailInclude,
  });
  if (!vehicle) return null;

  const citationTargets = [
    { entityType: "Vehicle", entityId: vehicle.id },
    { entityType: "ModelYear", entityId: vehicle.modelYear.id },
    { entityType: "Engine", entityId: vehicle.engine.id },
    ...(vehicle.dimensions
      ? [{ entityType: "VehicleDimensions", entityId: vehicle.dimensions.id }]
      : []),
    ...(vehicle.performance
      ? [{ entityType: "VehiclePerformance", entityId: vehicle.performance.id }]
      : []),
    ...(vehicle.fuelEconomy
      ? [{ entityType: "VehicleFuelEconomy", entityId: vehicle.fuelEconomy.id }]
      : []),
    ...vehicle.prices.map((price) => ({
      entityType: "VehiclePrice",
      entityId: price.id,
    })),
  ];

  const [citations, relatedTrims] = await Promise.all([
    prisma.sourceCitation.findMany({
      where: { OR: citationTargets },
      include: { source: true },
      orderBy: [{ source: { publisher: "asc" } }, { fieldName: "asc" }],
    }),
    prisma.vehicle.findMany({
      where: {
        modelYearId: vehicle.modelYearId,
        status: "PUBLISHED",
        id: { not: vehicle.id },
      },
      include: vehicleCardInclude,
      orderBy: { name: "asc" },
    }),
  ]);

  const imageSources = vehicle.images.flatMap((image) =>
    image.source ? [image.source] : [],
  );
  const sources = Array.from(
    new Map(
      [...citations.map((citation) => citation.source), ...imageSources].map(
        (source) => [source.id, source],
      ),
    ).values(),
  ).sort(
    (a, b) => a.publisher.localeCompare(b.publisher) || a.title.localeCompare(b.title),
  );

  return { vehicle, citations, relatedTrims, sources };
});

export const searchPublishedVehicles = cache(async (term: string) => {
  const numericYear = /^\d{4}$/.test(term) ? Number(term) : undefined;
  const where: Prisma.VehicleWhereInput = {
    status: "PUBLISHED",
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { modelYear: { generation: { code: { contains: term, mode: "insensitive" } } } },
      {
        modelYear: {
          generation: { displayName: { contains: term, mode: "insensitive" } },
        },
      },
      {
        modelYear: {
          generation: { model: { name: { contains: term, mode: "insensitive" } } },
        },
      },
      {
        modelYear: {
          generation: {
            model: { manufacturer: { name: { contains: term, mode: "insensitive" } } },
          },
        },
      },
      ...(numericYear ? [{ modelYear: { year: numericYear } }] : []),
    ],
  };

  return prisma.vehicle.findMany({
    where,
    include: vehicleCardInclude,
    orderBy: [{ publishedAt: "desc" }, { name: "asc" }],
    take: 50,
  });
});

export const getHomepageData = cache(async () => {
  const [vehicles, manufacturers, manufacturerCount, modelCount, vehicleCount] =
    await Promise.all([
      getPublishedVehicleCards(6),
      getManufacturerIndex(),
      prisma.manufacturer.count(),
      prisma.vehicleModel.count(),
      prisma.vehicle.count({ where: { status: "PUBLISHED" } }),
    ]);
  return {
    vehicles,
    manufacturers: manufacturers.slice(0, 6),
    manufacturerCount,
    modelCount,
    vehicleCount,
  };
});
