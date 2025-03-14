import PageHeader from "@/components/ui/PageHeader";

export default function MyAccount() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="My Account">
      <div className="py-5 px-5 w-full">
        <h2 className="text-4xl font-bold">My Account</h2>
      </div>
    </PageHeader>
  )
}