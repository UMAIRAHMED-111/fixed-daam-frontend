import { Plus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { WHATSAPP_NUMBER } from "@/lib/contact";

/**
 * The questions a first-time buyer actually stops on. Paying now for goods you
 * carry home later is an unusual bargain, so the objections get answered in
 * plain terms rather than reassured away.
 *
 * Built on native <details> so it works with the keyboard, with search-in-page,
 * and before any JavaScript loads.
 */
const FAQS = [
  {
    q: "What if I do not collect everything at once?",
    a: "Collect in as many visits as you like. The shop marks off what you have taken each time, and the rest keeps waiting at the price you paid.",
  },
  {
    q: "How does the shop know the goods are mine?",
    a: "Your order carries a six-digit code that changes every couple of minutes. Show it at the counter and the shopkeeper checks it against the order before handing anything over.",
  },
  {
    q: "When does my price actually lock?",
    a: `At checkout. You transfer the amount, send the confirmation screenshot to ${WHATSAPP_NUMBER} on WhatsApp, and once an admin has confirmed the payment, usually within two to three hours, the stock is set aside for you at that rate.`,
  },
  {
    q: "What if my payment is not approved?",
    a: "Nothing is charged and nothing is held. The reserved stock goes straight back to the shop and you will see the reason on your order.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can browse and check out as a guest with just your email and phone. You get a tracking link for the order, and if you register later with the same email, that order joins your account.",
  },
  {
    q: "Is delivery included?",
    a: `Yes, delivery comes with every purchase at no extra cost. Give us your address at checkout, then message ${WHATSAPP_NUMBER} on WhatsApp whenever you want it delivered.`,
  },
];

export function FaqSection() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <h2 className="text-display text-[clamp(2.25rem,5vw,3.25rem)] text-foreground">
            Before you lock a price
          </h2>
        </Reveal>

        <div className="mt-8 divide-y divide-border border-y border-border">
          {FAQS.map((item, i) => (
            <Reveal as="div" key={item.q} delay={i * 0.04}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <Plus
                    className="h-4 w-4 shrink-0 text-muted transition-transform duration-[var(--dur)] ease-[var(--ease-out-quart)] group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="max-w-[68ch] pb-5 leading-relaxed text-body">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
