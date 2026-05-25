import { PageHeading } from "@/components/page-heading";
import { PlaceholderModule } from "@/components/placeholder-module";

export default function SettingsPage() {
  return (
    <>
      <PageHeading
        eyebrow="System"
        title="Settings"
        description="Manage categories, imports, user roles, and operational defaults."
      />
      <PlaceholderModule title="Settings workflows are planned" />
    </>
  );
}
