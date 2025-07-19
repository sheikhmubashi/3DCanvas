import { CodeblockCard } from "../cards/codeblock-card";

const CodeIcon = () => (
 <svg
  className="h-6 w-6 text-purple-500"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <polyline points="16,18 22,12 16,6" />
  <polyline points="8,6 2,12 8,18" />
 </svg>
);

const codeblocksCards = [
 {
  title: "Create your first Codeblocks design",
  isCreate: true,
 },
 {
  title: "Table",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "3D table model",
 },
 {
  title: "Rocket to Mars",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Space rocket design",
 },
 {
  title: "Basket",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Woven basket model",
 },
];

export function CodeblocksSection() {
 return (
  <section className="mb-12 font-artifakt">
   <div className="flex items-center gap-2 mb-6">
    <CodeIcon />
    <h2 className="text-2xl font-artifakt-bold text-purple-500">Codeblocks</h2>
   </div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {codeblocksCards.map((card, index) => (
     <CodeblockCard
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
