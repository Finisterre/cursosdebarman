import { notFound } from "next/navigation";
import { getBannerById } from "@/lib/banners";
import { BannerForm } from "@/components/admin/banner-form";
import { updateBannerAction } from "./actions";
import type { BannerFormValues } from "@/lib/schemas/banner";
import type { Banner } from "@/types";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export const revalidate = 0;

function bannerToFormValues(banner: Banner): BannerFormValues {
  const startsAt = banner.starts_at ? banner.starts_at.slice(0, 16) : "";
  const endsAt = banner.ends_at ? banner.ends_at.slice(0, 16) : "";
  return {
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    image_url: banner.image_url,
    mobile_image_url: banner.mobile_image_url ?? "",
    link_url: banner.link_url ?? "",
    link_text: banner.link_text ?? "",
    position: banner.position,
    type: banner.type,
    display_order: banner.display_order,
    is_active: banner.is_active,
    show_title: banner.show_title,
    starts_at: startsAt,
    ends_at: endsAt
  };
}

export default async function EditBannerPage({ params }: { params: { id: string } }) {
  const banner = await getBannerById(params.id);
  if (!banner) notFound();

  const initialValues = bannerToFormValues(banner);

  return (
    <div className="space-y-6">
      <AdminBreadcrumb
        items={[
          { label: "Banners", href: "/admin/banners" },
          { label: "Editar banner" },
        ]}
      />
      <div>
        <h1 className="text-2xl font-semibold">Editar banner</h1>
        <p className="text-sm text-muted-foreground">{banner.title}</p>
      </div>
      <BannerForm
        initialValues={initialValues}
        bannerId={banner.id}
        updateBannerAction={updateBannerAction}
      />
    </div>
  );
}
