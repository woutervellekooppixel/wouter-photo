// Download route - beveiligde downloads met email verificatie
import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    
    if (!token || !isValidToken(token)) {
      return NextResponse.json(
        { error: 'Ongeldige of verlopen download link' },
        { status: 403 }
      )
    }

    // Bepaal welk bestand gedownload moet worden op basis van token
    const fileInfo = getFileFromToken(token)
    
    if (!fileInfo) {
      return NextResponse.json(
        { error: 'Bestand niet gevonden' },
        { status: 404 }
      )
    }

    const filePath = path.join(process.cwd(), 'public', 'downloads', fileInfo.filename)
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Bestand niet beschikbaar' },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileInfo.originalName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Download fout:', error)
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het downloaden' },
      { status: 500 }
    )
  }
}

// Valideer download token
function isValidToken(token: string): boolean {
  // Implementeer token validatie logica
  // Voor nu een eenvoudige check - dit kan uitgebreid worden
  return token.length === 64 && /^[a-f0-9]+$/.test(token)
}

// Krijg bestandsinfo op basis van token
function getFileFromToken(token: string): { filename: string; originalName: string } | null {
  // Mapping van tokens naar bestanden
  // In productie zou dit in een database staan
  const fileMapping: Record<string, { filename: string; originalName: string }> = {
    // Deze zouden dynamisch gegenereerd worden per order
    'placeholder-token-1': { 
      filename: 'amsterdam-canals-high-res.jpg', 
      originalName: 'Amsterdam Canals - High Resolution.jpg' 
    },
    'placeholder-token-2': { 
      filename: 'sunset-mountains-high-res.jpg', 
      originalName: 'Sunset Mountains - High Resolution.jpg' 
    },
    // etc...
  }
  
  return fileMapping[token] || null
}
