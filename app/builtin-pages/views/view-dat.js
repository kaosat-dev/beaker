import * as yo from 'yo-yo'
import { niceDate } from '../../lib/time'
import { ucfirst } from '../../lib/strings'
import { archiveEntries, entriesListToTree } from '../com/files-list'
import prettyBytes from 'pretty-bytes'
import emitStream from 'emit-stream'

// globals
// =

var archiveKey = (new URL(window.location)).host
var archiveInfo
var archiveEntriesTree

// event emitter
var archivesEvents


// exported API
// =

export function setup () {  
  // start event stream and register events
  archivesEvents = emitStream(beaker.dat.archivesEventStream())
  // archivesEvents.on('update-archive', onUpdateArchive)
}

export function show () {
  // fetch archive data
  beaker.dat.archiveInfo(archiveKey, (err, ai) => {
    console.log(ai)
    archiveInfo = ai
    archiveEntriesTree = entriesListToTree(archiveInfo)

    // TODO: sort

    render()
  })

  // TODO
}

export function hide () {
}


// rendering
// =

function render () {
  var m = archiveInfo.manifest
  var v = archiveInfo.versionHistory
  var name = m.name || m.short_name || 'Untitled Dat'

  // set page title
  document.title = name

  // optional els
  var nameEl = archiveInfo.isApp ? yo`<a href=${'dat://'+archiveInfo.key}>${name}</a>` : name
  var versionEl = v.current ? yo`<div class="vdh-version">v${v.current}</div>` : ''
  var authorEl = ''
  if (m.author) {
    if (m.homepage_url)
      authorEl = yo`<div class="vdh-author">by <a href=${m.homepage_url} title=${m.author}>${m.author}</a></div>`
    else
      authorEl = yo`<div class="vdh-author">by ${m.author}</div>`
  }
  var descriptionEl = (m.description) ? yo`<div class="view-dat-desc"><p>${m.description}</p></div>` : ''

  // render view
  yo.update(document.querySelector('#el-content'), yo`<div class="pane" id="el-content">
    <div class=${'view-dat'+(archiveInfo.isApp?' app':'')}>
      <div class="view-dat-header">
        <div class="vdh-title">
          <img class="favicon" src=${'beaker-favicon:dat://'+archiveInfo.key} />
          ${nameEl}
        </div>
        ${versionEl}
        ${authorEl}
        <div class="vdh-actions"></div>
        <div class="vdh-more-actions">
          <button class="btn btn-default">Extract files...</button>
        </div>
      </div>
      ${descriptionEl}
      ${archiveEntries(archiveEntriesTree, { showHead: false, onToggleNodeExpanded })}
    </div>
  </div>`)
}

function getPermDesc (perm) {
  switch (perm) {
    case 'fs':
      return 'Read and write files in a sandboxed folder.'
  }
}

// event handlers
// =

function onClick (archiveIndex) {
  return e => selectArchive(archiveIndex)
}

function onToggleNodeExpanded (node) {
  node.isOpen = !node.isOpen
  render()
}

function onUpdateArchive (update) {
  if (archives) {
    // find the archive being updated
    var archive = archives.find(a => a.key == update.key)
    if (archive) {
      // patch the archive
      for (var k in update)
        archive[k] = update[k]
    } else {
      // add to list
      archives.push(update)
    }
    render()
  }
}