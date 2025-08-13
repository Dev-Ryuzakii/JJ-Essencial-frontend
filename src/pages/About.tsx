import React from 'react'
import { 
  Heart, 
  Users, 
  Award, 
  Globe, 
  CheckCircle, 
  Star,
  Truck,
  Shield,
  Clock
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Link } from 'react-router-dom'

const About: React.FC = () => {
  const stats = [
    { label: 'Happy Customers', value: '50,000+', icon: Users },
    { label: 'Products Sold', value: '500,000+', icon: Award },
    { label: 'Years of Experience', value: '15+', icon: Clock },
    { label: 'Countries Served', value: '25+', icon: Globe }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Quality First',
      description: 'We carefully curate every product to ensure the highest quality standards for your kitchen and dining experience.'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We provide exceptional service and support every step of the way.'
    },
    {
      icon: Award,
      title: 'Innovation',
      description: 'We constantly seek innovative products and solutions to enhance your culinary journey.'
    },
    {
      icon: Globe,
      title: 'Sustainability',
      description: 'Committed to eco-friendly practices and sustainable products for a better future.'
    }
  ]

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over ₦50,000'
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '1-year warranty on all products'
    },
    {
      icon: CheckCircle,
      title: 'Easy Returns',
      description: '30-day hassle-free returns'
    }
  ]

  const team = [
    {
      name: 'John Johnson',
      role: 'Founder & CEO',
      image: '/api/placeholder/200/200',
      bio: 'Passionate about bringing quality kitchenware to every home.'
    },
    {
      name: 'Sarah Wilson',
      role: 'Head of Product',
      image: '/api/placeholder/200/200',
      bio: 'Expert in sourcing the finest kitchen and dining products.'
    },
    {
      name: 'Michael Chen',
      role: 'Customer Experience',
      image: '/api/placeholder/200/200',
      bio: 'Dedicated to ensuring every customer has an amazing experience.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">JJ Essential</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              For over 15 years, we've been your trusted partner in creating beautiful, functional kitchens 
              and dining spaces. From premium cookware to elegant tableware, we bring quality and style to every meal.
            </p>
            <div className="flex items-center justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
              <span className="text-gray-600 ml-2">Trusted by thousands of customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Founded in 2008 by culinary enthusiast John Johnson, JJ Essential started as a small family business 
                    with a simple mission: to make quality kitchenware accessible to everyone.
                  </p>
                  <p>
                    What began as a passion project in a small workshop has grown into one of Nigeria's most trusted 
                    kitchenware brands. We've maintained our commitment to quality while expanding our reach across Africa.
                  </p>
                  <p>
                    Today, we're proud to serve over 50,000 happy customers across 25 countries, offering everything 
                    from professional-grade cookware to elegant dining sets that bring families together.
                  </p>
                </div>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link to="/products">Shop Our Collection</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/api/placeholder/600/400"
                  alt="Our Story"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold text-purple-600">15+</div>
                  <div className="text-gray-600">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-6">
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why Choose JJ Essential?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center text-white">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-purple-100">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">
                The passionate people behind JJ Essential
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-48 h-48 object-cover rounded-full mx-auto shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Kitchen?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Discover our complete collection of premium kitchenware and dining essentials
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
