
/**
 * Tidybooks: a small invoicing product for freelancers and tiny teams. Emma
 * founded it and runs the website herself: a landing page, a blog, a help
 * centre, a demo booking page and a contact form. The kind of SaaS the CMS,
 * help-centre and web-agent videos are filmed for.
 */
export const SHOP = {
  name: 'Tidybooks',
  tagline: 'Simple invoicing for freelancers and small teams',
  owner: { first: 'Emma', last: 'Larsen' },
  email: 'emma@tidybooks.example',
};

export const POSTS = [
  {
    title: 'Five ways to get paid faster',
    slug: 'get-paid-faster',
    summary:
      'Late payments cost freelancers more than any tool. These five small habits shorten the wait between sending an invoice and seeing the money.',
    category: 'guides',
    tags: ['how_to', 'tips'],
    focus: 'getting paid faster',
    takeaways: ['Send the invoice the day the work is done', 'Say the due date in the email, not only on the invoice', 'Let reminders go out by themselves'],
    sources: ['https://www.gov.uk/late-commercial-payments-interest-debt-recovery'],
    daysAgo: 3,
    palette: 0,
    inlinePalette: 3,
    alt: 'A laptop showing a paid invoice next to a cup of coffee',
    sections: [
      {
        title: 'Send it the same day',
        body:
          'The longer you wait to invoice, the longer you wait to be paid. Send the invoice the day the work is done, while the client still remembers how happy they were.\n\n## Make the due date obvious\n\nPut the due date in the email as well as on the invoice. A client who has to hunt for it will not hurry.',
      },
      {
        title: 'Let reminders do the chasing',
        body:
          '## Be polite, be regular\n\nMost late invoices are forgotten, not refused. A friendly reminder a few days before and after the due date solves most of them.\n\n- Remind before the due date\n- Remind again a few days after\n- Offer a card or bank link on every invoice',
      },
    ],
    faqs: [
      { question: 'When should I send an invoice?', answer: 'As soon as the work is done or the milestone is reached. Waiting a week often means being paid a week later.' },
      { question: 'How long should payment terms be?', answer: 'Fourteen days is common for freelancers. Thirty days is fine for larger companies, but write it on every invoice.' },
    ],
  },
  {
    title: 'Meet the team behind Tidybooks',
    slug: 'meet-the-team',
    summary:
      'We are four people who were tired of chasing invoices ourselves. We sat down to talk about why we built Tidybooks and what we are proudest of.',
    category: 'opinion',
    tags: ['interview'],
    focus: 'invoicing team',
    takeaways: ['Built by freelancers who hated chasing invoices', 'Every feature starts from a real client story', 'Support answers come from people, not scripts'],
    sources: ['Interview with the Tidybooks team, September'],
    daysAgo: 9,
    palette: 4,
    alt: 'Four people around a table with laptops and a whiteboard',
    sections: [
      {
        title: 'Why we built it',
        body:
          'Emma was a freelancer before she was a founder. Her worst month was not the one with the least work, it was the one where four clients paid late at once.\n\n## What we promised ourselves\n\nOne screen to send an invoice, and nothing in the way of getting paid.',
      },
      {
        title: 'What we are proud of',
        body:
          'The first invoice takes about a minute. Reminders go out without anyone asking. And when something is unclear, a person answers, usually within the hour.\n\n## What is next\n\nMore languages, more payment options and a calmer inbox for everyone.',
      },
    ],
    faqs: [{ question: 'Can I talk to the team?', answer: 'Yes. Book a demo, or write to us. Emma reads every message.' }],
  },
  {
    title: 'What research says about late payments',
    slug: 'research-late-payments',
    summary:
      'Studies of small businesses agree: late payment is the number one cause of cash trouble, and a simple reminder is the cheapest fix.',
    category: 'guides',
    tags: ['research', 'tips'],
    focus: 'late payments research',
    takeaways: ['Late payment hurts small businesses most', 'Clear terms cut late invoices', 'A reminder works better than a phone call'],
    sources: ['https://www.ft.com/', 'Small Business Payments Survey, 2024'],
    daysAgo: 16,
    palette: 1,
    alt: 'A calendar with several circled due dates and a calculator',
    sections: [
      {
        title: 'What the studies found',
        body:
          'Surveys of small businesses keep finding the same thing: most cash problems are not about earning too little, they are about waiting too long.\n\n## Why reminders work\n\nA reminder is easy to ignore once and hard to ignore three times. It is also much friendlier than a phone call.',
      },
      {
        title: 'What to do with it',
        body:
          'You do not need special software to start.\n\n1. Write payment terms on every invoice\n2. Send a reminder before the due date\n3. Follow up a few days after',
      },
    ],
    faqs: [],
  },
  {
    title: 'What is new this autumn',
    slug: 'whats-new-this-autumn',
    summary:
      'Recurring invoices, a client portal and three new languages. Here is everything we shipped this autumn, and how to start using it.',
    category: 'news',
    tags: ['announcement', 'tips'],
    focus: 'product updates',
    takeaways: ['Recurring invoices for retainers', 'A portal where clients see everything they owe', 'Danish, Swedish and Finnish invoices'],
    sources: [],
    daysAgo: 23,
    palette: 2,
    alt: 'A dashboard with a list of invoices and a green paid badge',
    sections: [
      {
        title: 'Recurring invoices',
        body:
          'Retainers now send themselves. Set the amount and the day once, and Tidybooks creates and sends the invoice every month.\n\n## A portal for your clients\n\nClients get one page with every invoice they have received and a button to pay each one.',
      },
    ],
    faqs: [{ question: 'Do recurring invoices cost extra?', answer: 'No. They are included in every plan.' }],
  },
  {
    title: 'How a design studio in Bergen halved its late invoices',
    slug: 'design-studio-in-bergen',
    summary:
      'Fjord Studio used to chase six invoices a month. After switching on automatic reminders, they chase almost none. Here is how they set it up.',
    category: 'case_studies',
    tags: ['interview', 'how_to'],
    focus: 'design studio invoicing',
    takeaways: ['Reminders went on the day they signed up', 'Late invoices halved in two months', 'Nobody on the team chases clients any more'],
    sources: [],
    daysAgo: 30,
    palette: 5,
    alt: 'A bright design studio with two people at a long desk',
    sections: [
      {
        title: 'Switching reminders on',
        body:
          'Fjord Studio turned on automatic reminders the day they signed up: one before the due date, one a few days after.\n\n## The result\n\nWithin two months, late invoices were down by half, and nobody on the team had written a chasing email since.',
      },
    ],
    faqs: [],
  },
];

/** Customer-facing help articles: the knowledge base the FAQ and the chat answer from. */
export const HELP_ARTICLES = [
  {
    title: 'How do I send my first invoice?',
    body: 'Choose New invoice, pick or add a client, add the items and press Send. The client gets an email with the invoice and a button to pay it. Your first one takes about a minute.',
    category: 'getting_started',
  },
  {
    title: 'Can I change a client’s details after sending?',
    body: 'Yes. Open the client and edit the name or address. Invoices already sent keep the old details, new invoices use the new ones.',
    category: 'how_to',
  },
  {
    title: 'How do I pause or cancel my plan?',
    body: 'Open Billing and choose Pause or Cancel at any time. You can pause for up to three months, and cancelling has no fee. Your data stays available for 30 days.',
    category: 'billing',
  },
  {
    title: 'What does an invoice look like?',
    body: 'Each invoice has your logo, your details, the items with their prices, the total with tax and a clear due date. Clients see a Pay now button on top.',
    category: 'getting_started',
  },
  {
    title: 'Can I invite my accountant?',
    body: 'Yes. Open Team, add their email and choose the Accountant role. They can see every invoice and export reports, but cannot send or change anything.',
    category: 'how_to',
  },
];

/** A team-only page that must never reach the public FAQ. */
export const PRIVATE_ARTICLE = {
  title: 'Refund exceptions (team only)',
  body: 'Internal: refund within 60 days for a billing mistake, no questions asked.',
  category: 'policies',
};

/**
 * The landing page, written as blocks in the app (a page of Website content):
 * a hero, one block per feature card, a video and a call to action.
 */
export const HOME = {
  hero: "# Invoicing that gets you paid\n\nSend professional invoices in seconds, remind clients automatically and see who has paid. Built for freelancers and small teams.",
  features: [
    { title: 'Send in seconds', text: 'Pick a client, add the items and send. Your first invoice takes about a minute.', palette: 0 },
    { title: 'Automatic reminders', text: 'Tidybooks nudges late payers for you, politely and right on time.', palette: 3 },
    { title: 'Get paid online', text: 'Clients pay by card or bank transfer straight from the invoice.', palette: 5 },
  ],
  video: { title: 'See how it works', text: 'A short tour: create an invoice, send it and watch it get paid.' },
  call: "## Ready to send your first invoice?\n\nBook a demo with Emma, or write to her.",
};
