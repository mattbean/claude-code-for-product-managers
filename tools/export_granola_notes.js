const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const SUPABASE_FILE = path.join(
  process.env.HOME,
  'Library/Application Support/Granola/supabase.json'
);
const CACHE_FILE = path.join(
  process.env.HOME,
  'Library/Application Support/Granola/cache-v3.json'
);
const OUTPUT_DIR = path.join(process.cwd(), 'granola-notes');
const METADATA_FILE = path.join(process.cwd(), 'granola-notes', '.last-export.json');
const GRANOLA_API_BASE = 'https://api.granola.ai';

// Helper: Make HTTPS request with gzip support
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'Accept-Encoding': 'gzip, deflate'
      },
      timeout: 60000
    };

    const req = https.request(requestOptions, (res) => {
      const chunks = [];
      const encoding = res.headers['content-encoding'];
      let stream = res;

      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      }

      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
      stream.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Convert ProseMirror JSON to Markdown
function prosemirrorToMarkdown(doc) {
  if (!doc || !doc.content) return '';

  function processNode(node, depth = 0) {
    if (!node.type) return '';

    switch (node.type) {
      case 'doc':
        return (node.content || []).map(n => processNode(n, depth)).join('\n\n');

      case 'paragraph':
        const paraContent = (node.content || []).map(n => processNode(n, depth)).join('');
        return paraContent || '';

      case 'heading':
        const level = node.attrs?.level || 1;
        const headingContent = (node.content || []).map(n => processNode(n, depth)).join('');
        return '#'.repeat(level) + ' ' + headingContent;

      case 'text':
        let text = node.text || '';
        if (node.marks) {
          node.marks.forEach(mark => {
            switch (mark.type) {
              case 'bold':
              case 'strong':
                text = `**${text}**`;
                break;
              case 'italic':
              case 'em':
                text = `*${text}*`;
                break;
              case 'code':
                text = `\`${text}\``;
                break;
              case 'link':
                text = `[${text}](${mark.attrs?.href || ''})`;
                break;
            }
          });
        }
        return text;

      case 'bulletList':
      case 'bullet_list':
        return (node.content || []).map(n => processNode(n, depth)).join('\n');

      case 'orderedList':
      case 'ordered_list':
        return (node.content || []).map((n, i) => {
          const itemContent = processNode(n, depth).replace(/^- /, '');
          return `${i + 1}. ${itemContent}`;
        }).join('\n');

      case 'listItem':
      case 'list_item':
        const itemContent = (node.content || [])
          .map(n => processNode(n, depth + 1))
          .join('\n');
        return '- ' + itemContent;

      case 'codeBlock':
      case 'code_block':
        const code = (node.content || []).map(n => n.text || '').join('');
        const lang = node.attrs?.language || '';
        return '```' + lang + '\n' + code + '\n```';

      case 'blockquote':
        return (node.content || [])
          .map(n => '> ' + processNode(n, depth))
          .join('\n');

      case 'hardBreak':
      case 'hard_break':
        return '  \n';

      case 'horizontalRule':
      case 'horizontal_rule':
        return '---';

      default:
        if (node.content) {
          return (node.content || []).map(n => processNode(n, depth)).join('');
        }
        return '';
    }
  }

  return processNode(doc).trim();
}

// Convert transcript array to readable markdown
function transcriptToMarkdown(transcriptArray) {
  if (!Array.isArray(transcriptArray) || transcriptArray.length === 0) {
    return '';
  }

  let markdown = '';

  transcriptArray.forEach(utterance => {
    const text = utterance.text || '';
    const source = utterance.source === 'microphone' ? 'You' : 'Speaker';
    const startTime = utterance.start_timestamp ? new Date(utterance.start_timestamp) : null;

    if (startTime) {
      const timeStr = startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      markdown += `**[${timeStr}] ${source}:** ${text}\n\n`;
    } else {
      markdown += `**${source}:** ${text}\n\n`;
    }
  });

  return markdown.trim();
}

// Get last export metadata
function getLastExportDate() {
  try {
    if (fs.existsSync(METADATA_FILE)) {
      const metadata = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
      return metadata.lastExportDate ? new Date(metadata.lastExportDate) : null;
    }
  } catch (error) {
    // Ignore errors, treat as no previous export
  }
  return null;
}

// Save export metadata
function saveExportDate(date) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify({
      lastExportDate: date.toISOString()
    }, null, 2), 'utf8');
  } catch (error) {
    console.error('Warning: Could not save export metadata:', error.message);
  }
}

// Main function
async function exportNotesWithTranscripts() {
  console.log('Granola Notes + Transcripts Exporter\n' + '='.repeat(50) + '\n');

  // Read credentials
  console.log('Reading Supabase credentials...');
  const supabaseData = JSON.parse(fs.readFileSync(SUPABASE_FILE, 'utf8'));
  const workosTokens = JSON.parse(supabaseData.workos_tokens);
  const accessToken = workosTokens.access_token;
  const userInfo = JSON.parse(supabaseData.user_info);

  console.log(`Authenticated as: ${userInfo.email}`);

  // Read local cache for transcripts
  console.log('Reading local cache for transcripts...');
  const outerData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  const cacheData = JSON.parse(outerData.cache);
  const transcripts = cacheData.state.transcripts;

  console.log(`Found ${Object.keys(transcripts).length} transcripts in cache\n`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check for incremental export
  const lastExportDate = getLastExportDate();
  let cutoffDate = null;

  if (lastExportDate) {
    // Overlap by 1 day to catch anything created between fetches
    cutoffDate = new Date(lastExportDate);
    cutoffDate.setDate(cutoffDate.getDate() - 1);
    console.log(`Incremental export: fetching notes updated after ${cutoffDate.toLocaleDateString()}`);
  } else {
    console.log('First export: fetching all notes');
  }

  // Fetch documents from API
  console.log('Fetching notes from Granola API...\n');

  try {
    const response = await httpsRequest(`${GRANOLA_API_BASE}/v2/get-documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Granola/6.317.0'
      },
      body: {
        limit: 100,
        offset: 0,
        include_last_viewed_panel: true
      }
    });

    const documents = response.data.docs || response.data;
    console.log(`Received ${Array.isArray(documents) ? documents.length : 'unknown'} documents`);

    if (!Array.isArray(documents)) {
      console.error('Error: Response is not an array');
      return;
    }

    // Filter for incremental export
    let docsToProcess = documents;
    if (cutoffDate) {
      docsToProcess = documents.filter(doc => {
        const updatedDate = new Date(doc.updated_at || doc.created_at);
        return updatedDate > cutoffDate;
      });
      console.log(`Filtered to ${docsToProcess.length} new/updated documents since cutoff\n`);
    } else {
      console.log('');
    }

    // Process each document
    let successCount = 0;
    let transcriptCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const exportStartTime = new Date();

    for (const doc of docsToProcess.slice(0, 100)) {
      try {
        const title = doc.title || 'Untitled';
        console.log(`Processing: ${title}`);

        // Get AI summary content
        const content = doc.last_viewed_panel?.content || doc.notes;

        if (!content || !content.content) {
          console.log(`  ⊘ Skipped: No content available`);
          skippedCount++;
          continue;
        }

        const markdown = prosemirrorToMarkdown(content);

        if (!markdown || markdown.trim().length === 0) {
          console.log(`  ⊘ Skipped: Empty content after conversion`);
          skippedCount++;
          continue;
        }

        // Check for transcript
        const hasTranscript = transcripts[doc.id] && Array.isArray(transcripts[doc.id]);
        const transcript = hasTranscript ? transcripts[doc.id] : null;

        // Create filename
        const sanitizedTitle = title
          .replace(/[^a-z0-9]/gi, '-')
          .replace(/-+/g, '-')
          .toLowerCase()
          .substring(0, 50);

        const timestamp = doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : 'unknown';
        const filename = `${timestamp}-${sanitizedTitle}.md`;
        const filepath = path.join(OUTPUT_DIR, filename);

        // Create markdown with frontmatter
        let output = '---\n';
        output += `title: "${title.replace(/"/g, '\\"')}"\n`;
        if (doc.created_at) output += `created: ${doc.created_at}\n`;
        if (doc.updated_at) output += `updated: ${doc.updated_at}\n`;
        if (doc.id) output += `id: ${doc.id}\n`;
        output += `has_transcript: ${hasTranscript}\n`;
        output += '---\n\n';

        // Add AI summary
        output += '## AI Summary\n\n';
        output += markdown;

        // Add transcript if available
        if (transcript) {
          output += '\n\n---\n\n';
          output += '## Full Transcript\n\n';
          output += transcriptToMarkdown(transcript);
          transcriptCount++;
        }

        // Write file
        fs.writeFileSync(filepath, output, 'utf8');
        console.log(`  ✓ Saved${hasTranscript ? ' (with transcript)' : ''}: ${filename}`);
        successCount++;

      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Export complete!`);
    console.log(`  Success: ${successCount} documents`);
    console.log(`  With transcripts: ${transcriptCount} documents`);
    console.log(`  Skipped: ${skippedCount} documents (no content)`);
    console.log(`  Errors: ${errorCount} documents`);
    console.log(`  Output directory: ${OUTPUT_DIR}`);

    // Save export metadata for next incremental run
    if (successCount > 0) {
      saveExportDate(exportStartTime);
      console.log(`  Last export date saved for next incremental sync`);
    }

  } catch (error) {
    console.error(`\nAPI Error: ${error.message}`);
  }
}

// Run
exportNotesWithTranscripts().catch(console.error);
