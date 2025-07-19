import { DesignCard } from "../cards/design-card";

const BoxIcon = () => (
 <svg
  className="h-6 w-6 text-blue-500"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <path
   strokeLinecap="round"
   strokeLinejoin="round"
   strokeWidth={2}
   d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  />
 </svg>
);

const designCards = [
 {
  title: "Create your first 3D design",
  isCreate: true,
 },
 {
  title: "Place It",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Learn the basics of placing objects",
 },
 {
  title: "View It",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Navigate around your design",
 },
 {
  title: "Move It",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Position objects precisely",
 },
];

export function DesignsSection() {
 return (
  <section className="mb-12 font-artifakt">
   <div className="flex items-center gap-2 mb-6">
    <BoxIcon />
    <h2 className="text-2xl font-artifakt-bold text-blue-500">3D Designs</h2>
   </div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {designCards.map((card, index) => (
     <DesignCard
      key={index}
      title={card.title}
      thumbnail={card.thumbnail}
      subtitle={card.subtitle}
      isCreate={card.isCreate}
     />
    ))}
   </div>
  </section>
 );
}
