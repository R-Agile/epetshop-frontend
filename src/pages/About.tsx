import { Heart, Users, Award, Leaf } from 'lucide-react';

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Products' },
  { value: '15+', label: 'Years Experience' },
  { value: '24/7', label: 'Customer Support' },
];

const values = [
  {
    icon: Heart,
    title: 'Pet-First Approach',
    description:
      'Every product we sell is carefully selected with your pets health and happiness in mind.',
  },
  {
    icon: Award,
    title: 'Quality Guaranteed',
    description:
      'We partner with trusted brands to ensure premium quality for all our products.',
  },
  {
    icon: Users,
    title: 'Community Focused',
    description:
      'We build a community of pet lovers who share tips, stories, and support each other.',
  },
  {
    icon: Leaf,
    title: 'Eco-Conscious',
    description:
      'We prioritize sustainable and eco-friendly products to protect our planet.',
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-cream to-background overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-50" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            About <span className="text-primary">PawStore</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're passionate pet lovers dedicated to bringing you the best products
            for your furry, feathery, and finned family members.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Our <span className="text-primary">Story</span>
              </h2>
              <p className="text-muted-foreground mb-4">
                PawStore was founded in 2009 by a group of passionate pet owners who
                struggled to find quality products for their beloved companions. What
                started as a small local shop has grown into a trusted online
                destination for pet lovers worldwide.
              </p>
              <p className="text-muted-foreground mb-4">
                Our mission is simple: to provide pets with the best products that
                enhance their health, happiness, and well-being. We carefully curate
                every item in our store, ensuring it meets our high standards of
                quality and safety.
              </p>
              <p className="text-muted-foreground">
                Today, we serve thousands of pet families, and every wagging tail,
                purr, chirp, or bubble fills our hearts with joy. We're not just a
                store – we're a community of pet lovers who understand the special
                bond between humans and their animal companions.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=700&fit=crop"
                alt="Happy pets"
                className="rounded-3xl shadow-medium"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-medium">
                <p className="text-3xl font-display font-bold">15+</p>
                <p className="text-sm">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-cream paw-pattern">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Our <span className="text-primary">Values</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              These core principles guide everything we do at PawStore
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border card-hover"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Meet Our <span className="text-primary">Team</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-12">
            The passionate pet lovers behind PawStore
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
              },
              {
                name: 'Michael Chen',
                role: 'Head of Products',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
              },
              {
                name: 'Emily Davis',
                role: 'Customer Care Lead',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
              },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                />
                <h3 className="font-display font-bold text-foreground text-lg">
                  {member.name}
                </h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
