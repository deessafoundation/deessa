/**
 * Structured Data Component
 * 
 * Renders JSON-LD structured data in the page head for SEO
 */

interface StructuredDataProps {
  data: any | any[]
}

export function StructuredData({ data }: StructuredDataProps) {
  const dataArray = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {dataArray.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
        />
      ))}
    </>
  )
}
