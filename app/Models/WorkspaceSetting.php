<?php

namespace App\Models;

class WorkspaceSetting extends WorkspaceModel
{
    protected $table = 'workspace_settings';

    protected $fillable = ['id', 'payload'];
}
