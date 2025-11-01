import { ChatFileUploadCard } from "@/components/chat/ChatFileUploadCard";

const ImportProducts = () => {
  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Import Products</h1>
        <p className="text-sm text-muted-foreground">Upload Excel or CSV files to import products into your dashboard.</p>
      </header>

      <section className="max-w-2xl">
        <div>
          <h2 className="text-lg font-semibold mb-3">Upload Excel or CSV File</h2>
          <ChatFileUploadCard />
        </div>
      </section>
    </main>
  );
};

export default ImportProducts;
