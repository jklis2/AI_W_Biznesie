import PageHeader from "@/components/ui/PageHeader";

export default function MyOrders() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="My Orders">
      <div className="py-5 px-5 w-full">
        <h2 className="text-4xl font-bold">My Orders</h2>
      </div>
    </PageHeader>
  )
}