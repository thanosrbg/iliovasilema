# setup_vite_tailwind.ps1
# Improved version with UTF8NoBOM, safer writes, folder/file recreation

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Write-Utf8NoBom {
    param(
        [string]$Path,
        [string]$Content
    )
    [System.IO.File]::WriteAllText($Path, $Content, $Utf8NoBom)
}

function Read-Utf8 {
    param([string]$Path)
    return [System.IO.File]::ReadAllText($Path, $Utf8NoBom)
}

function Ensure-Folder {
    param([string]$Path)

    if (!(Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "Created folder: $Path" -ForegroundColor Green
    }
}

function Ensure-File {
    param(
        [string]$Path,
        [string]$Content
    )

    if (Test-Path $Path) {
        Write-Host "Recreating file: $Path" -ForegroundColor Yellow
    }
    else {
        Write-Host "Creating file: $Path" -ForegroundColor Green
    }

    Write-Utf8NoBom $Path $Content
}

function Update-PackageJson {
    param([string]$Path)

    if (!(Test-Path $Path)) { return }

    $pkgContent = Read-Utf8 $Path

    if ($pkgContent -match '^\xEF\xBB\xBF') {
        $pkgContent = $pkgContent.Substring(3)
    }

    $pkg = $pkgContent | ConvertFrom-Json

    if (-not $pkg.scripts) {
        $pkg | Add-Member -NotePropertyName "scripts" -NotePropertyValue @{}
    }

    $pkg.scripts.dev = "vite --open"

    Write-Utf8NoBom $Path ($pkg | ConvertTo-Json -Depth 10)
    Write-Host "Updated package.json" -ForegroundColor Green
}

function Setup-Project {
    $currentDir = Get-Location

    $paths = @{
        viteConfig = Join-Path $currentDir "vite.config.js"
        src        = Join-Path $currentDir "src"
        pages      = Join-Path $currentDir "src\pages"
        components = Join-Path $currentDir "src\components"
        styles     = Join-Path $currentDir "src\styles"
        assets     = Join-Path $currentDir "src\assets"

        oldCss     = Join-Path $currentDir "src\index.css"
        newCss     = Join-Path $currentDir "src\styles\index.css"
        appCss     = Join-Path $currentDir "src\App.css"
        main       = Join-Path $currentDir "src\main.jsx"
        app        = Join-Path $currentDir "src\App.jsx"
        home       = Join-Path $currentDir "src\pages\Home.jsx"
        package    = Join-Path $currentDir "package.json"
    }

    try {
        Write-Host "`nSetting up your Vite + Tailwind project...`n" -ForegroundColor Magenta

        Write-Host "Installing react-router-dom..." -ForegroundColor Cyan
        npm install react-router-dom
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install react-router-dom"
        }

        Write-Host "Installing Tailwind..." -ForegroundColor Cyan
        npm install -D tailwindcss @tailwindcss/vite
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install Tailwind"
        }

        # Create folders
        Ensure-Folder $paths.src
        Ensure-Folder $paths.pages
        Ensure-Folder $paths.components
        Ensure-Folder $paths.styles
        Ensure-Folder $paths.assets

        # vite.config.js
        $viteConfig = @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
'@

        Ensure-File $paths.viteConfig $viteConfig

        # Tailwind CSS
        Ensure-File $paths.newCss '@import "tailwindcss";'

        # Remove old CSS
        if (Test-Path $paths.oldCss) { Remove-Item $paths.oldCss -Force }
        if (Test-Path $paths.appCss) { Remove-Item $paths.appCss -Force }

        # Home.jsx
        $homeContent = $homeContent = @'
import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import '../styles/index.css'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-[#16171d]">

        <div className="relative mb-10">
          <img src={heroImg} className="w-40" alt="hero" />

          <img src={reactLogo} className="absolute top-8.5 left-1/2 -translate-x-1/2 w-7" />
          <img src={viteLogo} className="absolute top-26.75 left-1/2 -translate-x-1/2 w-6.5" />
        </div>

        <h1 className="text-4xl font-bold mb-2">Get started</h1>

        <p className="text-zinc-400 mb-6 text-center">
          Edit src/Home.jsx and save to test HMR
        </p>

        <button
          type="button"
          className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>

        <div className="mt-10 grid gap-6 md:grid-cols-2 w-full max-w-5xl px-6">

          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <svg className="w-6 h-6 mb-3" aria-hidden="true">
              <use href="/icons.svg#documentation-icon" />
            </svg>

            <h2 className="text-lg font-semibold">Documentation</h2>
            <p className="text-zinc-400 mb-4">Your questions, answered</p>

            <div className="flex flex-row gap-3">
              <a
                href="https://vite.dev/"
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-black"
              >
                <img src={viteLogo} className="w-5 h-5" />
                Explore Vite
              </a>

              <a
                href="https://react.dev/"
                target="_blank"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                <img src={reactLogo} className="w-5 h-5" />
                Learn more
              </a>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <svg className="w-6 h-6 mb-3" aria-hidden="true">
              <use href="/icons.svg#social-icon" />
            </svg>

            <h2 className="text-lg font-semibold">Connect with us</h2>
            <p className="text-zinc-400 mb-4">Join the community</p>

            <div className="flex flex-row flex-nowrap gap-4">
              <a href="https://github.com/vitejs/vite"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <svg className="w-5 h-5">
                  <use href="/icons.svg#github-icon" />
                </svg>
                GitHub
              </a>

              <a href="https://chat.vite.dev/"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <svg className="w-5 h-5">
                  <use href="/icons.svg#discord-icon" />
                </svg>
                Discord
              </a>

              <a href="https://x.com/vite_js"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <svg className="w-5 h-5">
                  <use href="/icons.svg#x-icon" />
                </svg>
                X
              </a>

              <a href="https://bsky.app/profile/vite.dev"
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition">
                <svg className="w-5 h-5">
                  <use href="/icons.svg#bluesky-icon" />
                </svg>
                Bluesky
              </a>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

export default Home
'@

        Ensure-File $paths.home $homeContent

        # App.jsx
        $appContent = @'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
'@

        Ensure-File $paths.app $appContent

        # main.jsx
        $defaultMainContent = @'
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@

        if (!(Test-Path $paths.main)) {
            Ensure-File $paths.main $defaultMainContent
        }
        else {
            $content = Read-Utf8 $paths.main

            $content = $content -replace 'import\s+["'']\./index\.css["''];?\s*', ''

            if ($content -notmatch './styles/index\.css') {
                $content = $content -replace '(import .*?from ["'']react-dom/client["''])', "`$1`nimport './styles/index.css';"
            }

            Write-Utf8NoBom $paths.main $content
            Write-Host "Updated main.jsx" -ForegroundColor Green
        }

        # package.json
        Update-PackageJson $paths.package

        Write-Host "`nSetup completed successfully!" -ForegroundColor Green
        Write-Host "`nRun this command to start the dev server:" -ForegroundColor Cyan
        Write-Host "   npm run dev" -ForegroundColor Yellow
    }
    catch {
        Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    }
}

Setup-Project