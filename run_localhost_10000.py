import uvicorn
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="External Government Land Record Verification Portal",
    description="External portal simulation utilizing the Government Open API key and endpoints",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
def index():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>External Portal - Government API Verification</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
            body {
                font-family: 'Manrope', sans-serif;
            }
        </style>
    </head>
    <body class="bg-[#f8faf4] text-[#191c19] min-h-screen">
        <header class="bg-[#003b1b] text-white py-5 shadow-sm">
            <div class="container mx-auto px-6 flex justify-between items-center">
                <div class="flex items-center space-x-3.5">
                    <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shadow-inner">
                        <i class="fa-solid fa-cloud-arrow-down text-xl text-[#b1f2be]"></i>
                    </div>
                    <div>
                        <h1 class="font-extrabold text-xl tracking-tight">Third-Party Integration Client</h1>
                        <p class="text-xs text-[#b1f2be]/80 font-medium">Querying Government Open API Gateway (Port 8000)</p>
                    </div>
                </div>
                <div class="bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold backdrop-blur-md">
                    <span class="text-[#b1f2be]">Port 10000:</span> External Client Mode
                </div>
            </div>
        </header>

        <main class="container mx-auto px-6 py-12 max-w-4xl space-y-8">
            <div class="bg-white rounded-2xl shadow-sm p-8 border border-[#c0c9be] bg-cadastral">
                <h2 class="text-2xl font-bold text-[#003b1b] mb-6 flex items-center">
                    <i class="fa-solid fa-server mr-3"></i> Verify Document from Govt DB
                </h2>
                
                <form id="verifyForm" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-[#404941] mb-2">Government API Key</label>
                            <input type="text" id="apiKey" required placeholder="Paste API Key generated from Govt portal"
                                class="w-full bg-[#f2f4ee] px-4 py-3 rounded-xl border border-[#c0c9be] text-[#191c19] focus:outline-none focus:ring-2 focus:ring-[#14532d] transition">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-[#404941] mb-2">Verification Code (Optional - ID / Survey No.)</label>
                            <input type="text" id="code" placeholder="Leave empty to fetch ALL values"
                                class="w-full bg-[#f2f4ee] px-4 py-3 rounded-xl border border-[#c0c9be] text-[#191c19] focus:outline-none focus:ring-2 focus:ring-[#14532d] transition">
                        </div>
                    </div>
                    <button type="submit" 
                        class="w-full bg-[#14532d] hover:bg-[#0b3c1f] text-white font-extrabold py-3.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer">
                        <i class="fa-solid fa-share-from-square"></i>
                        <span>Fetch Verified Land Record from Govt Portal (Port 8000)</span>
                    </button>
                </form>
            </div>

            <!-- Single Result Section -->
            <div id="resultContainer" class="mt-8 hidden">
                <div class="bg-white rounded-2xl shadow-sm border border-[#c0c9be] overflow-hidden">
                    <div class="bg-[#e7e9e3] px-6 py-4.5 font-bold flex justify-between items-center border-b border-[#c0c9be] text-[#003b1b]">
                        <span class="flex items-center gap-2"><i class="fa-solid fa-file-circle-check text-lg"></i> External API Data Result</span>
                        <span id="badge" class="bg-[#b1f2be] text-[#12512c] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"></span>
                    </div>
                    <div class="p-6 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 class="text-xs font-extrabold text-[#404941] uppercase tracking-wider mb-2">Administrative Info</h3>
                                <div class="bg-[#f2f4ee] p-4.5 rounded-xl space-y-2.5 text-sm text-[#191c19] border border-[#c0c9be]" id="adminInfo"></div>
                            </div>
                            <div>
                                <h3 class="text-xs font-extrabold text-[#404941] uppercase tracking-wider mb-2">Land & Area Details</h3>
                                <div class="bg-[#f2f4ee] p-4.5 rounded-xl space-y-2.5 text-sm text-[#191c19] border border-[#c0c9be]" id="landInfo"></div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-xs font-extrabold text-[#404941] uppercase tracking-wider mb-2">Owners</h3>
                            <div class="bg-[#f2f4ee] p-4.5 rounded-xl overflow-x-auto text-sm text-[#191c19] border border-[#c0c9be]" id="ownersInfo"></div>
                        </div>

                        <div>
                            <h3 class="text-xs font-extrabold text-[#404941] uppercase tracking-wider mb-2">Raw JSON Response Payload</h3>
                            <pre class="bg-[#191c19] text-[#87c695] p-4.5 rounded-xl text-xs overflow-x-auto max-h-60" id="jsonRaw"></pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Multi Results Section -->
            <div id="multiResultsContainer" class="mt-8 hidden">
                <div class="bg-white rounded-2xl shadow-sm border border-[#c0c9be] overflow-hidden">
                    <div class="bg-[#e7e9e3] px-6 py-4.5 font-bold flex justify-between items-center border-b border-[#c0c9be] text-[#003b1b]">
                        <span class="flex items-center gap-2"><i class="fa-solid fa-list-check text-lg"></i> All Retrieved Land Records</span>
                        <span id="recordsCount" class="bg-[#b1f2be] text-[#12512c] text-xs font-extrabold px-3 py-1 rounded-full"></span>
                    </div>
                    <div class="p-6 space-y-6">
                        <div id="recordsList" class="space-y-4"></div>
                        
                        <div>
                            <h3 class="text-xs font-extrabold text-[#404941] uppercase tracking-wider mb-2">Raw JSON Response Payload</h3>
                            <pre class="bg-[#191c19] text-[#87c695] p-4.5 rounded-xl text-xs overflow-x-auto max-h-60" id="multiJsonRaw"></pre>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error Banner -->
            <div id="errorContainer" class="mt-8 hidden bg-[#ffd9dc] border border-[#ffb2bb] text-[#591d28] p-6 rounded-2xl flex items-start space-x-3">
                <i class="fa-solid fa-circle-exclamation text-2xl text-[#ba1a1a] mt-1"></i>
                <div>
                    <h3 class="font-extrabold text-lg">Failed to Retrieve Document</h3>
                    <p id="errorMessage" class="text-sm mt-1 font-medium"></p>
                </div>
            </div>
        </main>

        <script>
            document.getElementById('verifyForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const apiKey = document.getElementById('apiKey').value;
                const code = document.getElementById('code').value;
                
                const resultContainer = document.getElementById('resultContainer');
                const multiResultsContainer = document.getElementById('multiResultsContainer');
                const errorContainer = document.getElementById('errorContainer');
                
                resultContainer.classList.add('hidden');
                multiResultsContainer.classList.add('hidden');
                errorContainer.classList.add('hidden');
                
                try {
                    const url = code.trim() 
                        ? `http://localhost:8000/api/govt/verify?code=${encodeURIComponent(code)}&api_key=${encodeURIComponent(apiKey)}`
                        : `http://localhost:8000/api/govt/verify?api_key=${encodeURIComponent(apiKey)}`;
                        
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.detail || 'An error occurred during verification.');
                    }
                    
                    if (data.records) {
                        document.getElementById('recordsCount').innerText = `${data.count} Records`;
                        const list = data.records.map(record => `
                            <div class="bg-[#f2f4ee] p-5 rounded-xl border border-[#c0c9be] space-y-3.5">
                                <div class="flex justify-between items-center border-b border-[#c0c9be] pb-2">
                                    <span class="font-bold text-[#003b1b]">Record ID: ${record.id} (Doc ID: ${record.document_id})</span>
                                    <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#e7e9e3] border border-[#c0c9be] text-[#404941]">${record.validation_status}</span>
                                </div>
                                <div class="grid grid-cols-2 gap-4 text-xs text-[#404941] font-medium">
                                    <div>
                                        <p><span class="font-bold text-[#191c19]">State:</span> ${record.administrative.state}</p>
                                        <p><span class="font-bold text-[#191c19]">Village:</span> ${record.administrative.village}</p>
                                    </div>
                                    <div>
                                        <p><span class="font-bold text-[#191c19]">Survey No:</span> ${record.land.survey_number}</p>
                                        <p><span class="font-bold text-[#191c19]">Area:</span> ${record.land.total_area || 'N/A'} ${record.land.area_unit}</p>
                                    </div>
                                </div>
                                <div class="text-xs text-[#404941] font-medium">
                                    <span class="font-bold text-[#191c19]">Owners:</span> 
                                    ${record.owners.map(o => o.owner_name || o.name || 'Unknown').join(', ') || 'None'}
                                </div>
                            </div>
                        `).join('');
                        document.getElementById('recordsList').innerHTML = list;
                        document.getElementById('multiJsonRaw').textContent = JSON.stringify(data, null, 2);
                        multiResultsContainer.classList.remove('hidden');
                    } else if (data.record) {
                        const record = data.record;
                        const badge = document.getElementById('badge');
                        badge.innerText = record.validation_status || 'VERIFIED';
                        
                        document.getElementById('adminInfo').innerHTML = `
                            <div><span class="font-bold text-[#404941]">State:</span> ${record.administrative.state}</div>
                            <div><span class="font-bold text-[#404941]">District:</span> ${record.administrative.district}</div>
                            <div><span class="font-bold text-[#404941]">Taluk:</span> ${record.administrative.taluk || 'N/A'}</div>
                            <div><span class="font-bold text-[#404941]">Village:</span> ${record.administrative.village}</div>
                            <div><span class="font-bold text-[#404941]">Sub-Registrar:</span> ${record.administrative.sub_registrar_office || 'N/A'}</div>
                        `;
                        
                        document.getElementById('landInfo').innerHTML = `
                            <div><span class="font-bold text-[#404941]">Survey Number:</span> ${record.land.survey_number}</div>
                            <div><span class="font-bold text-[#404941]">Hissa Number:</span> ${record.land.hissa_number || 'N/A'}</div>
                            <div><span class="font-bold text-[#404941]">Khata Number:</span> ${record.land.khata_number || 'N/A'}</div>
                            <div><span class="font-bold text-[#404941]">Total Area:</span> ${record.land.total_area || 'N/A'} ${record.land.area_unit}</div>
                            <div><span class="font-bold text-[#404941]">Land Tenure:</span> ${record.land.land_tenure || 'N/A'}</div>
                        `;
                        
                        if (record.owners && record.owners.length > 0) {
                            const list = record.owners.map(o => `
                                <div class="border-b border-[#c0c9be] pb-2 mb-2 last:border-0 last:pb-0 font-medium">
                                    <div class="font-bold text-[#191c19]">${o.owner_name || o.name || 'Unknown Owner'}</div>
                                    <div class="text-xs text-[#404941]">Ownership Share: ${o.share || 'N/A'}</div>
                                </div>
                            `).join('');
                            document.getElementById('ownersInfo').innerHTML = list;
                        } else {
                            document.getElementById('ownersInfo').innerHTML = '<div class="text-[#404941] italic">No owners data found</div>';
                        }
                        
                        document.getElementById('jsonRaw').textContent = JSON.stringify(data, null, 2);
                        resultContainer.classList.remove('hidden');
                    }
                } catch (err) {
                    document.getElementById('errorMessage').innerText = err.message;
                    errorContainer.classList.remove('hidden');
                }
            });
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    print("Starting External API Portal on http://localhost:10000...")
    uvicorn.run("run_localhost_10000:app", host="0.0.0.0", port=10000, reload=True)
