import { CircuitCard } from "../cards/circuit-card";

const ZapIcon = () => (
 <svg
  className="h-6 w-6 text-green-500"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
 </svg>
);

const circuitCards = [
 {
  title: "Create your first circuit",
  isCreate: true,
 },
 {
  title: "Blink an LED",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Learn basic LED control",
 },
 {
  title: "Button Control",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Use buttons to control circuits",
 },
 {
  title: "Sensor Reading",
  thumbnail: "/images/dummy-box-image.jpg",
  subtitle: "Read sensor data",
 },
];

export function CircuitsSection() {
 return (
  <section className="mb-12 font-artifakt">
   <div className="flex items-center gap-2 mb-6">
    <ZapIcon />
    <h2 className="text-2xl font-artifakt-bold text-green-500">Circuits</h2>
   </div>
   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    {circuitCards.map((card, index) => (
     <CircuitCard
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
