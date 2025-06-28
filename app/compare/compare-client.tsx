"use client"

import { useState, useEffect, useRef } from "react"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string
  name: string
  imageUrl: string
  price: number
  description: string
}

const CompareClient = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const componentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const productIds = searchParams.getAll("id")

    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/products?ids=${productIds.join(",")}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Could not fetch products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (productIds.length > 0) {
      fetchProducts()
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const generatePDF = async () => {
    if (!componentRef.current) return

    const doc = new jsPDF()

    // Add logo
    const logoResponse = await fetch("/logo.png")
    const logoBlob = await logoResponse.blob()
    const logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(logoBlob)
    })
    doc.addImage(logoDataUrl, "PNG", 14, 14, 64, 10)

    // Set document information
    doc.setProperties({
      title: "Product Comparison",
      subject: "Comparison of selected products",
      author: "Your Company",
    })

    // Define columns
    const columns = [
      { header: "Feature", dataKey: "feature" },
      ...products.map((product) => ({ header: product.name, dataKey: product.id })),
    ]

    // Define rows
    const rows: { feature: string; [key: string]: any }[] = [
      { feature: "Name", ...products.reduce((acc, product) => ({ ...acc, [product.id]: product.name }), {}) },
      { feature: "Price", ...products.reduce((acc, product) => ({ ...acc, [product.id]: `$${product.price}` }), {}) },
      {
        feature: "Description",
        ...products.reduce((acc, product) => ({ ...acc, [product.id]: product.description }), {}),
      },
    ]

    // Add table to the document
    ;(doc as any).autoTable({
      head: columns,
      body: rows,
      startY: 35,
    })

    // Save the PDF
    doc.save("product_comparison.pdf")
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Product Comparison</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-40 w-full mb-2" />
              <Skeleton className="h-6 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Comparison</h1>

      {products.length === 0 ? (
        <p>No products selected for comparison.</p>
      ) : (
        <div ref={componentRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="h-40 w-full object-cover mb-2 rounded-md"
                />
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">${product.price}</p>
                <p className="text-sm mt-2">{product.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {products.length > 0 && <Button onClick={generatePDF}>Generate PDF</Button>}
    </div>
  )
}

export default CompareClient
