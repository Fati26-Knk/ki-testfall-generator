"""
Script to convert SRS Markdown document to PDF
Requires: markdown and weasyprint
"""
import markdown
from weasyprint import HTML, CSS
from pathlib import Path
import sys

def convert_markdown_to_pdf(md_file, pdf_file):
    """Convert Markdown file to PDF with styling"""
    
    # Read markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # Convert markdown to HTML with extensions
    html_content = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'codehilite', 'nl2br']
    )
    
    # Add CSS styling for better PDF appearance
    html_with_style = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{
                size: A4;
                margin: 2cm;
                @bottom-center {{
                    content: "Seite " counter(page) " von " counter(pages);
                    font-size: 9pt;
                    color: #666;
                }}
            }}
            body {{
                font-family: 'Segoe UI', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                font-size: 10pt;
            }}
            h1 {{
                color: #1a1a1a;
                border-bottom: 3px solid #0066cc;
                padding-bottom: 10px;
                margin-top: 30px;
                font-size: 24pt;
                page-break-after: avoid;
            }}
            h2 {{
                color: #0066cc;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 8px;
                margin-top: 25px;
                font-size: 18pt;
                page-break-after: avoid;
            }}
            h3 {{
                color: #0066cc;
                margin-top: 20px;
                font-size: 14pt;
                page-break-after: avoid;
            }}
            h4 {{
                color: #333;
                margin-top: 15px;
                font-size: 12pt;
                page-break-after: avoid;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 15px 0;
                font-size: 9pt;
                page-break-inside: avoid;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #0066cc;
                color: white;
                font-weight: bold;
            }}
            tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            code {{
                background-color: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: 9pt;
            }}
            pre {{
                background-color: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                overflow-x: auto;
                page-break-inside: avoid;
            }}
            blockquote {{
                border-left: 4px solid #0066cc;
                margin-left: 0;
                padding-left: 20px;
                color: #666;
                font-style: italic;
            }}
            ul, ol {{
                margin: 10px 0;
                padding-left: 30px;
            }}
            li {{
                margin: 5px 0;
            }}
            hr {{
                border: none;
                border-top: 2px solid #e0e0e0;
                margin: 30px 0;
            }}
            strong {{
                color: #000;
            }}
            em {{
                color: #555;
            }}
            .page-break {{
                page-break-after: always;
            }}
        </style>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    try:
        # Convert HTML to PDF using WeasyPrint
        HTML(string=html_with_style).write_pdf(pdf_file)
        print(f"✅ PDF erfolgreich erstellt: {pdf_file}")
        return True
    except Exception as e:
        print(f"❌ Fehler bei der PDF-Erstellung: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # Define paths
    project_root = Path(__file__).parent.parent
    md_file = project_root / "docs" / "SRS-Dokument.md"
    pdf_file = project_root / "docs" / "SRS-Dokument.pdf"
    
    print(f"📄 Konvertiere {md_file} zu PDF...")
    
    if not md_file.exists():
        print(f"❌ Markdown-Datei nicht gefunden: {md_file}")
        sys.exit(1)
    
    success = convert_markdown_to_pdf(md_file, pdf_file)
    sys.exit(0 if success else 1)
